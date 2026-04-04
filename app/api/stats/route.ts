import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStartOfDay, getEndOfDay } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const periodParam = searchParams.get("period") ?? "7";
    const period = parseInt(periodParam, 10);

    if (![7, 30, 90].includes(period)) {
      return NextResponse.json({ success: false, error: "Période invalide" }, { status: 400 });
    }

    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - period + 1);
    startDate.setHours(0, 0, 0, 0);

    const [habits, expenses, incomes, goals] = await Promise.all([
      db.habit.findMany({
        where: { userId: session.user.id, isArchived: false },
        include: { completions: { where: { date: { gte: startDate } } } },
      }),
      db.expense.findMany({
        where: { userId: session.user.id, date: { gte: startDate, lte: now } },
        orderBy: { date: "asc" },
      }),
      db.income.findMany({
        where: { userId: session.user.id, date: { gte: startDate, lte: now } },
      }),
      db.goal.findMany({
        where: { userId: session.user.id },
      }),
    ]);

    // --- Données journalières habitudes ---
    const days: Array<{ date: string; completed: number; total: number; rate: number; dayOfWeek: number }> = [];

    for (let i = 0; i < period; i++) {
      const day = new Date(startDate);
      day.setDate(day.getDate() + i);
      const dayStart = getStartOfDay(day);
      const dayEnd = getEndOfDay(day);

      const completed = habits.filter((h) =>
        h.completions.some((c) => c.date >= dayStart && c.date <= dayEnd)
      ).length;

      days.push({
        date: day.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
        completed,
        total: habits.length,
        rate: habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0,
        dayOfWeek: day.getDay(), // 0=dim, 1=lun, ...
      });
    }

    // --- Taux moyen de complétion ---
    const avgCompletionRate = days.length > 0
      ? Math.round(days.reduce((sum, d) => sum + d.rate, 0) / days.length)
      : 0;

    // --- Tendance : 1ère moitié vs 2ème moitié ---
    const half = Math.floor(days.length / 2);
    const firstHalf = days.slice(0, half);
    const secondHalf = days.slice(half);
    const avgFirst = firstHalf.length > 0
      ? Math.round(firstHalf.reduce((s, d) => s + d.rate, 0) / firstHalf.length) : 0;
    const avgSecond = secondHalf.length > 0
      ? Math.round(secondHalf.reduce((s, d) => s + d.rate, 0) / secondHalf.length) : 0;
    const trend = avgSecond - avgFirst; // positif = amélioration

    // --- Jour de la semaine le plus productif ---
    const DAY_LABELS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    const dayStats: Record<number, { sum: number; count: number }> = {};
    for (const d of days) {
      if (!dayStats[d.dayOfWeek]) dayStats[d.dayOfWeek] = { sum: 0, count: 0 };
      dayStats[d.dayOfWeek].sum += d.rate;
      dayStats[d.dayOfWeek].count++;
    }
    let bestDayOfWeek: { label: string; rate: number } | null = null;
    for (const [dow, stat] of Object.entries(dayStats)) {
      const avg = Math.round(stat.sum / stat.count);
      if (!bestDayOfWeek || avg > bestDayOfWeek.rate) {
        bestDayOfWeek = { label: DAY_LABELS[parseInt(dow)], rate: avg };
      }
    }

    // --- Top habitudes par taux de complétion ---
    const topHabits = habits
      .map((h) => ({
        name: h.name,
        icon: h.icon,
        color: h.color,
        rate: period > 0 ? Math.round((h.completions.length / period) * 100) : 0,
        completions: h.completions.length,
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5);

    // --- Dépenses par mois ---
    const expensesByMonth: Record<string, number> = {};
    for (const expense of expenses) {
      const key = new Date(expense.date).toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
      expensesByMonth[key] = (expensesByMonth[key] ?? 0) + expense.amount;
    }
    const expensesChart = Object.entries(expensesByMonth).map(([month, total]) => ({
      month,
      total: Math.round(total * 100) / 100,
    }));

    // --- Dépenses par catégorie ---
    const categoryMap: Record<string, number> = {};
    for (const expense of expenses) {
      categoryMap[expense.category] = (categoryMap[expense.category] ?? 0) + expense.amount;
    }
    const expensesByCategory = Object.entries(categoryMap)
      .map(([category, amount]) => ({ category, amount: Math.round(amount * 100) / 100 }))
      .sort((a, b) => b.amount - a.amount);

    // --- Revenus totaux ---
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

    // --- Stats objectifs ---
    const activeGoals = goals.filter((g) => g.current < g.target);
    const completedGoals = goals.filter((g) => g.current >= g.target);
    const globalGoalPct = goals.length > 0
      ? Math.round(goals.reduce((sum, g) => sum + Math.min(g.current / g.target, 1), 0) / goals.length * 100)
      : 0;
    const bestGoal = goals.length > 0
      ? goals.reduce((best, g) => {
          const pct = g.target > 0 ? g.current / g.target : 0;
          const bestPct = best.target > 0 ? best.current / best.target : 0;
          return pct > bestPct ? g : best;
        })
      : null;

    // --- Meilleure habitude (streak) ---
    const bestHabit = habits.reduce(
      (best, h) => (h.currentStreak > (best?.currentStreak ?? 0) ? h : best),
      null as (typeof habits)[0] | null
    );

    // --- Totaux ---
    const totalCompleted = habits.reduce((sum, h) => sum + h.completions.length, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    return NextResponse.json({
      success: true,
      data: {
        days,
        expensesChart,
        expensesByCategory,
        bestHabit: bestHabit
          ? { name: bestHabit.name, streak: bestHabit.currentStreak, icon: bestHabit.icon }
          : null,
        topHabits,
        avgCompletionRate,
        trend,
        avgFirst,
        avgSecond,
        bestDayOfWeek,
        totalIncome: Math.round(totalIncome * 100) / 100,
        goalsStats: {
          active: activeGoals.length,
          completed: completedGoals.length,
          total: goals.length,
          globalPct: globalGoalPct,
          bestGoal: bestGoal
            ? {
                title: bestGoal.title,
                icon: bestGoal.icon,
                color: bestGoal.color,
                pct: bestGoal.target > 0 ? Math.round((bestGoal.current / bestGoal.target) * 100) : 0,
              }
            : null,
        },
        summary: {
          totalCompleted,
          totalExpenses: Math.round(totalExpenses * 100) / 100,
          habitsCount: habits.length,
        },
      },
    });
  } catch (error) {
    console.error("[STATS]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
