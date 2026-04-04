import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStartOfMonth, getEndOfMonth } from "@/lib/utils";

// Default monthly budget limit (could be a user setting in the future)
const DEFAULT_MONTHLY_BUDGET = 2000;

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
      const [year, month] = monthParam.split("-").map(Number);
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59, 999);
    } else {
      startDate = getStartOfMonth();
      endDate = getEndOfMonth();
    }

    const expenses = await db.expense.findMany({
      where: {
        userId: session.user.id,
        date: { gte: startDate, lte: endDate },
      },
    });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const budget = DEFAULT_MONTHLY_BUDGET;
    const remaining = budget - total;
    const percentageUsed = Math.min(Math.round((total / budget) * 100), 100);

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
