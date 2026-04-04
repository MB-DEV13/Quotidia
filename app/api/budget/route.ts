import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStartOfMonth, getEndOfMonth } from "@/lib/utils";
import { generateOccurrenceDates, generateGroupId } from "@/lib/recurring";

const createExpenseSchema = z.object({
  amount: z.number().positive("Le montant doit être positif"),
  category: z.string().min(1, "La catégorie est requise"),
  label: z.string().optional(),
  date: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurrenceInterval: z.enum(["weekly", "monthly", "custom"]).optional(),
  recurrenceDays: z.number().int().min(1).max(365).optional(),
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const monthParam = searchParams.get("month"); // format: "2026-03"
    const yearParam = searchParams.get("year");

    let startDate: Date;
    let endDate: Date;

    if (monthParam) {
      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(monthParam)) {
        return NextResponse.json({ success: false, error: "Format de mois invalide" }, { status: 400 });
      }
      const [year, month] = monthParam.split("-").map(Number);
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59, 999);
    } else if (yearParam) {
      if (!/^\d{4}$/.test(yearParam)) {
        return NextResponse.json({ success: false, error: "Format d'année invalide" }, { status: 400 });
      }
      const year = parseInt(yearParam);
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    } else {
      startDate = getStartOfMonth();
      endDate = getEndOfMonth();
    }

    const expenses = await db.expense.findMany({
      where: {
        userId: session.user.id,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: "desc" },
    });

    // Summary by category
    const summaryMap = new Map<string, number>();
    let total = 0;
    for (const expense of expenses) {
      total += expense.amount;
      summaryMap.set(expense.category, (summaryMap.get(expense.category) ?? 0) + expense.amount);
    }

    const summary = Array.from(summaryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    }));

    return NextResponse.json({ success: true, data: { expenses, summary, total } });
  } catch (error) {
    console.error("[BUDGET_GET]", error);
    return NextResponse.json({ success: false, error: "Erreur interne" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createExpenseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // Freemium : 2 catégories max par mois pour les gratuits
    const userPlan = await db.user.findUnique({
      where: { id: session.user.id },
      select: { isPremium: true },
    });
    if (!userPlan?.isPremium) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      const existingCategories = await db.expense.findMany({
        where: { userId: session.user.id, date: { gte: startOfMonth, lte: endOfMonth } },
        select: { category: true },
        distinct: ["category"],
      });
      const usedCategories = new Set(existingCategories.map((e) => e.category));
      const usedCount = usedCategories.size;
      if (usedCount >= 2 && !usedCategories.has(parsed.data.category)) {
        return NextResponse.json(
          {
            success: false,
            error: `Compte gratuit : ${usedCount}/2 catégories utilisées ce mois. Premium pour des catégories illimitées.`,
            limitReached: true,
            usedCount,
            maxCount: 2,
          },
          { status: 403 }
        );
      }
    }

    const startDate = parsed.data.date ? new Date(parsed.data.date) : new Date();
    const groupId = parsed.data.isRecurring && parsed.data.recurrenceInterval
      ? generateGroupId()
      : null;

    const expense = await db.expense.create({
      data: {
        userId: session.user.id,
        amount: parsed.data.amount,
        category: parsed.data.category,
        label: parsed.data.label,
        date: startDate,
        isRecurring: parsed.data.isRecurring,
        recurrenceInterval: parsed.data.recurrenceInterval,
        recurrenceDays: parsed.data.recurrenceDays,
        recurringGroupId: groupId,
      },
    });

    // Générer toutes les occurrences suivantes (jusqu'à 12 mois)
    if (groupId && parsed.data.recurrenceInterval) {
      const allDates = generateOccurrenceDates(
        startDate,
        parsed.data.recurrenceInterval,
        parsed.data.recurrenceDays ?? null,
        12
      );
      const futureDates = allDates.slice(1); // exclure la première (déjà créée)

      if (futureDates.length > 0) {
        await db.expense.createMany({
          data: futureDates.map((date) => ({
            userId: session.user.id,
            amount: parsed.data.amount,
            category: parsed.data.category,
            label: parsed.data.label ?? null,
            date,
            isRecurring: true,
            recurrenceInterval: parsed.data.recurrenceInterval,
            recurrenceDays: parsed.data.recurrenceDays ?? null,
            recurringGroupId: groupId,
          })),
        });
      }
    }

    return NextResponse.json({ success: true, data: expense }, { status: 201 });
  } catch (error) {
    console.error("[BUDGET_POST]", error);
    return NextResponse.json({ success: false, error: "Erreur interne" }, { status: 500 });
  }
}
