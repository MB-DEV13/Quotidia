import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  authenticateBridgeUser,
  getBridgeTransactions,
  mapBridgeCategoryToExpense,
  mapBridgeCategoryToIncome,
  guessCategoryFromLabel,
} from "@/lib/bridge";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const bankConnection = await db.bankConnection.findUnique({
    where: { userId: session.user.id },
  });

  if (!bankConnection || bankConnection.status !== "active") {
    return NextResponse.json({ error: "Aucune banque connectée" }, { status: 400 });
  }

  try {
    const auth = await authenticateBridgeUser(bankConnection.bridgeUserId);

    // Synchroniser depuis la dernière sync (ou 30 jours)
    const since = bankConnection.lastSyncAt
      ? new Date(bankConnection.lastSyncAt.getTime() - 86400000) // -1 jour pour éviter les trous
      : new Date(Date.now() - 30 * 86400000);
    const sinceStr = since.toISOString().slice(0, 10);

    const transactions = await getBridgeTransactions(auth.access_token, sinceStr);

    let imported = 0;
    for (const tx of transactions) {
      const bridgeId = `bridge_${tx.id}`;
      const txDate = new Date(tx.date);
      const absAmount = Math.abs(tx.amount);

      const txLabel = tx.clean_description || tx.bank_description;

      if (tx.amount < 0) {
        const rawCategory = mapBridgeCategoryToExpense(tx.category_id);
        const category = rawCategory === "Autres" ? guessCategoryFromLabel(txLabel) : rawCategory;
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
          update: { amount: absAmount, category, label: txLabel },
        });
        imported++;
      } else if (tx.amount > 0) {
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
          update: { amount: absAmount, label: txLabel },
        });
        imported++;
      }
    }

    await db.bankConnection.update({
      where: { userId: session.user.id },
      data: { lastSyncAt: new Date() },
    });

    return NextResponse.json({ success: true, imported });
  } catch (err) {
    console.error("[BRIDGE_SYNC]", err);
    await db.bankConnection.update({
      where: { userId: session.user.id },
      data: { status: "error" },
    });
    return NextResponse.json({ error: "Erreur de synchronisation" }, { status: 500 });
  }
}
