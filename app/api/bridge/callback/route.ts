import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  authenticateBridgeUser,
  getBridgeItems,
  getBridgeBank,
  getBridgeTransactions,
  mapBridgeCategoryToExpense,
  mapBridgeCategoryToIncome,
  guessCategoryFromLabel,
} from "@/lib/bridge";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { searchParams } = new URL(req.url);
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/budget?bridge=error", req.url));
  }

  try {
    const bankConnection = await db.bankConnection.findUnique({
      where: { userId: session.user.id },
    });
    if (!bankConnection) {
      return NextResponse.redirect(new URL("/budget?bridge=error", req.url));
    }

    // Authentifier l'utilisateur Bridge
    const auth = await authenticateBridgeUser(bankConnection.bridgeUserId);

    // Récupérer les items (banques connectées)
    const items = await getBridgeItems(auth.access_token);
    const item = items[0];

    if (!item) {
      await db.bankConnection.update({
        where: { userId: session.user.id },
        data: { status: "error" },
      });
      return NextResponse.redirect(new URL("/budget?bridge=error", req.url));
    }

    // Récupérer les infos de la banque
    let bankName = item.name;
    let bankLogoUrl: string | undefined;
    try {
      const bank = await getBridgeBank(item.bank_id);
      bankName = bank.name;
      bankLogoUrl = bank.logo_url;
    } catch { /* ignore */ }

    // Mettre à jour la connexion
    await db.bankConnection.update({
      where: { userId: session.user.id },
      data: {
        bridgeItemId: item.id,
        bankName,
        bankLogoUrl,
        status: "active",
        lastSyncAt: new Date(),
      },
    });

    // Passer en mode automatique
    await db.user.update({
      where: { id: session.user.id },
      data: { budgetMode: "automatic" },
    });

    // Synchroniser les transactions (90 derniers jours)
    const since = new Date();
    since.setDate(since.getDate() - 90);
    const sinceStr = since.toISOString().slice(0, 10);

    const transactions = await getBridgeTransactions(auth.access_token, sinceStr);

    for (const tx of transactions) {
      const bridgeId = `bridge_${tx.id}`;
      const txDate = new Date(tx.date);
      const absAmount = Math.abs(tx.amount);

      if (tx.amount < 0) {
        const txLabel = tx.clean_description || tx.bank_description;
        const rawCategory = mapBridgeCategoryToExpense(tx.category_id);
        const category = rawCategory === "Autres" ? guessCategoryFromLabel(txLabel) : rawCategory;
        // Dépense
        await db.expense.upsert({
          where: { bridgeTransactionId: bridgeId },
          create: {
            userId: session.user.id,
            amount: absAmount,
            category,
            label: txLabel,
            date: txDate,
            source: "bank_sync",
            bridgeTransactionId: bridgeId,
          },
          update: {
            amount: absAmount,
            category,
            label: txLabel,
          },
        });
      } else if (tx.amount > 0) {
        const txLabel = tx.clean_description || tx.bank_description;
        // Revenu
        await db.income.upsert({
          where: { bridgeTransactionId: bridgeId },
          create: {
            userId: session.user.id,
            amount: absAmount,
            category: mapBridgeCategoryToIncome(tx.category_id),
            label: txLabel,
            date: txDate,
            source: "bank_sync",
            bridgeTransactionId: bridgeId,
          },
          update: {
            amount: absAmount,
            label: txLabel,
          },
        });
      }
    }

    return NextResponse.redirect(new URL("/budget?bridge=success", req.url));
  } catch (err) {
    console.error("[BRIDGE_CALLBACK]", err);
    return NextResponse.redirect(new URL("/budget?bridge=error", req.url));
  }
}
