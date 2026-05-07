import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStartOfMonth, getEndOfMonth } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const monthParam = searchParams.get("month");

    let startDate: Date;
    let endDate: Date;

    if (monthParam) {
      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(monthParam)) {
        return NextResponse.json({ success: false, error: "Format de mois invalide" }, { status: 400 });
      }
      const [year, month] = monthParam.split("-").map(Number);
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59, 999);
    } else {
      startDate = getStartOfMonth();
      endDate = getEndOfMonth();
    }

    const [expenses, budgetConfig] = await Promise.all([
      db.expense.findMany({
        where: {
          userId: session.user.id,
          date: { gte: startDate, lte: endDate },
        },
      }),
      db.budgetConfig.findUnique({
        where: { userId: session.user.id },
        select: { monthlyBudget: true, configured: true },
      }),
    ]);

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const budget = budgetConfig?.configured && budgetConfig.monthlyBudget > 0
      ? budgetConfig.monthlyBudget
      : null;
    const remaining = budget !== null ? budget - total : null;
    const percentageUsed = budget !== null && budget > 0
      ? Math.round((total / budget) * 100)
      : null;

    const categoryMap = new Map<string, number>();
    for (const expense of expenses) {
      categoryMap.set(expense.category, (categoryMap.get(expense.category) ?? 0) + expense.amount);
    }

    const byCategory = Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    })).sort((a, b) => b.amount - a.amount);

    return NextResponse.json({
      success: true,
      data: {
        total,
        budget,
        remaining,
        percentageUsed,
        byCategory,
        month: monthParam ?? new Date().toISOString().slice(0, 7),
      },
    });
  } catch (error) {
    console.error("[BUDGET_SUMMARY_GET]", error);
    return NextResponse.json({ success: false, error: "Erreur interne" }, { status: 500 });
  }
}
