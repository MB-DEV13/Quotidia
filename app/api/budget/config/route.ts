import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateOccurrenceDates } from "@/lib/recurring";

const configSchema = z.object({
  monthlyBudget: z.number().min(0).optional(),
  incomeAmount: z.number().min(0).optional(),
  incomePeriod: z.number().int().min(1).max(365).optional(),
  incomeLabel: z.string().optional(),
  configured: z.boolean().optional(),
});

// Identifiant utilisé pour les revenus auto-générés depuis la config
function configGroupId(userId: string) {
  return `cfg-income-${userId}`;
}

function periodToInterval(days: number): { interval: "weekly" | "monthly" | "custom"; customDays?: number } {
  if (days === 7) return { interval: "weekly" };
  if (days === 30) return { interval: "monthly" };
  return { interval: "custom", customDays: days };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const config = await db.budgetConfig.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error("[BUDGET_CONFIG_GET]", error);
    return NextResponse.json({ success: false, error: "Erreur interne" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = configSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // Sauvegarder la config
    const config = await db.budgetConfig.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, ...parsed.data },
      update: parsed.data,
    });

    const incomeAmount = parsed.data.incomeAmount ?? config.incomeAmount;
    const incomePeriod = parsed.data.incomePeriod ?? config.incomePeriod;
    const incomeLabel = parsed.data.incomeLabel ?? config.incomeLabel ?? "Revenu";

    // Sync auto-revenus si un montant est configuré
    if (incomeAmount > 0 && incomePeriod >= 1) {
      const groupId = configGroupId(session.user.id);

      // Supprimer les anciens auto-revenus (reconfiguration)
      await db.income.deleteMany({
        where: { userId: session.user.id, recurringGroupId: groupId },
      });

      // Générer les dates à partir du 1er du mois courant
      const startDate = new Date();
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);

      const { interval, customDays } = periodToInterval(incomePeriod);
      const allDates = generateOccurrenceDates(startDate, interval, customDays ?? null, 12);

      if (allDates.length > 0) {
        await db.income.createMany({
          data: allDates.map((date) => ({
            userId: session.user.id,
            amount: incomeAmount,
            category: "Salaire",
            label: incomeLabel,
            date,
            isRecurring: true,
            recurrenceInterval: interval,
            recurrenceDays: customDays ?? null,
            recurringGroupId: groupId,
          })),
        });
      }
    } else if (incomeAmount === 0) {
      // Montant remis à 0 → supprimer les auto-revenus
      await db.income.deleteMany({
        where: { userId: session.user.id, recurringGroupId: configGroupId(session.user.id) },
      });
    }

    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error("[BUDGET_CONFIG_PATCH]", error);
    return NextResponse.json({ success: false, error: "Erreur interne" }, { status: 500 });
  }
}
