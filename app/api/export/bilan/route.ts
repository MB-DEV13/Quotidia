import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { isPremium: true },
    });
    if (!user?.isPremium) {
      return NextResponse.json({ success: false, error: "Premium requis" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") === "weekly" ? "weekly" : "monthly";

    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (type === "weekly") {
      const day = now.getDay() || 7;
      startDate = new Date(now);
      startDate.setDate(now.getDate() - day + 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const [habits, expenses, incomes, goals] = await Promise.all([
      db.habit.findMany({
        where: { userId: session.user.id, isArchived: false },
        include: {
          completions: {
            where: { date: { gte: startDate, lte: endDate } },
          },
        },
      }),
      db.expense.findMany({
        where: { userId: session.user.id, date: { gte: startDate, lte: endDate } },
        orderBy: { date: "desc" },
      }),
      db.income.findMany({
        where: { userId: session.user.id, date: { gte: startDate, lte: endDate } },
        orderBy: { date: "desc" },
      }),
      db.goal.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000);

    const formattedHabits = habits.map((h) => ({
      name: h.name,
      currentStreak: h.currentStreak,
      completionRate: daysInPeriod > 0 ? Math.round((h.completions.length / daysInPeriod) * 100) : 0,
    }));

    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);

    return NextResponse.json({
      success: true,
      habits: formattedHabits,
      expenses: expenses.map((e) => ({ ...e, date: e.date.toISOString() })),
      incomes: incomes.map((i) => ({ ...i, date: i.date.toISOString() })),
      goals: goals.map((g) => ({ title: g.title, current: g.current, target: g.target, unit: g.unit })),
      summary: { totalExpenses, totalIncome, balance: totalIncome - totalExpenses },
    });
  } catch (error) {
    console.error("[BILAN_PDF]", error);
    return NextResponse.json({ success: false, error: "Erreur interne" }, { status: 500 });
  }
}
