import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function getWeekBounds(weekParam: string | null): { start: Date; end: Date } {
  if (weekParam && /^\d{4}-W\d{2}$/.test(weekParam)) {
    const [yearStr, weekStr] = weekParam.split("-W");
    const year = parseInt(yearStr, 10);
    const week = parseInt(weekStr, 10);

    const jan4 = new Date(year, 0, 4);
    const startOfYear = new Date(jan4);
    startOfYear.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));

    const start = new Date(startOfYear);
    start.setDate(start.getDate() + (week - 1) * 7);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  // Default: current week (Monday to Sunday)
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { start: monday, end: sunday };
}

function toWeekParam(date: Date): string {
  const year = date.getFullYear();
  const jan4 = new Date(year, 0, 4);
  const startOfYear = new Date(jan4);
  startOfYear.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
  const week = Math.ceil(
    ((date.getTime() - startOfYear.getTime()) / 86400000 + 1) / 7
  );
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const weekParam = searchParams.get("week");
    const { start, end } = getWeekBounds(weekParam);

    const prevStart = new Date(start);
    prevStart.setDate(start.getDate() - 7);
    const prevEnd = new Date(end);
    prevEnd.setDate(end.getDate() - 7);

    const [habits, expenses, goals, budgetConfig, prevHabits] = await Promise.all([
      db.habit.findMany({
        where: { userId: session.user.id, isArchived: false },
        include: {
          completions: { where: { date: { gte: start, lte: end } } },
        },
      }),
      db.expense.findMany({
        where: { userId: session.user.id, date: { gte: start, lte: end } },
      }),
      db.goal.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      }),
      db.budgetConfig.findUnique({ where: { userId: session.user.id } }),
      db.habit.findMany({
        where: { userId: session.user.id, isArchived: false },
        include: {
          completions: { where: { date: { gte: prevStart, lte: prevEnd } } },
        },
      }),
    ]);

    // --- Habitudes ---
    const totalPossible = habits.length * 7;
    const totalCompleted = habits.reduce((sum, h) => sum + h.completions.length, 0);
    const completionRate =
      totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

    const bestHabit = habits.reduce(
      (best, h) =>
        h.completions.length > (best?.completions.length ?? -1) ? h : best,
      null as (typeof habits)[0] | null
    );

    // --- Grille jour par jour ---
    const DAY_SHORT = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const dayByDay = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      const dayStart = new Date(day); dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day); dayEnd.setHours(23, 59, 59, 999);
      const completed = habits.filter((h) =>
        h.completions.some((c) => c.date >= dayStart && c.date <= dayEnd)
      ).length;
      dayByDay.push({
        dayLabel: DAY_SHORT[day.getDay()],
        completed,
        total: habits.length,
        rate: habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0,
      });
    }

    // --- Comparaison semaine précédente ---
    const prevTotal = prevHabits.reduce((sum, h) => sum + h.completions.length, 0);
    const prevPossible = prevHabits.length * 7;
    const prevRate = prevPossible > 0 ? Math.round((prevTotal / prevPossible) * 100) : 0;
    const prevComparison = { rate: prevRate, diff: completionRate - prevRate };

    // --- XP estimé ---
    const xpThisWeek = totalCompleted * 10;

    // --- Dépenses ---
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const monthlyBudget = budgetConfig?.monthlyBudget ?? budgetConfig?.incomeAmount ?? 0;
    const budgetWeekly = monthlyBudget > 0 ? Math.round((monthlyBudget / 4) * 100) / 100 : null;

    // Top catégories
    const categoryMap: Record<string, number> = {};
    for (const e of expenses) {
      categoryMap[e.category] = (categoryMap[e.category] ?? 0) + e.amount;
    }
    const topCategories = Object.entries(categoryMap)
      .map(([category, amount]) => ({ category, amount: Math.round(amount * 100) / 100 }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    // --- Score global ---
    const budgetScore =
      budgetWeekly !== null && budgetWeekly > 0
        ? totalExpenses <= budgetWeekly
          ? 100
          : Math.max(0, Math.round(100 - ((totalExpenses - budgetWeekly) / budgetWeekly) * 100))
        : null;
    const score =
      budgetScore !== null
        ? Math.round(completionRate * 0.6 + budgetScore * 0.4)
        : completionRate;
    const grade =
      score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "F";

    // --- Streaks ---
    const streakHighlights = habits
      .filter((h) => h.currentStreak > 0 || h.completions.length > 0)
      .sort((a, b) => b.currentStreak - a.currentStreak)
      .slice(0, 4)
      .map((h) => ({
        name: h.name,
        icon: h.icon,
        streak: h.currentStreak,
        maintained: h.completions.length > 0,
      }));

    // --- Objectifs ---
    const goalsProgress = goals.slice(0, 4).map((g) => ({
      title: g.title,
      icon: (g as { icon?: string }).icon ?? "🎯",
      color: (g as { color?: string }).color ?? "#5B5EA6",
      pct: g.target > 0 ? Math.min(Math.round((g.current / g.target) * 100), 100) : 0,
    }));

    // --- Message motivant ---
    let motivationMessage = "";
    if (completionRate >= 90) {
      motivationMessage = "Semaine exceptionnelle ! Tu es une vraie machine. Continue sur cette lancée !";
    } else if (completionRate >= 70) {
      motivationMessage = "Belle semaine ! Tu progresses bien. Encore un petit effort pour atteindre la perfection.";
    } else if (completionRate >= 50) {
      motivationMessage = "Semaine correcte. La régularité est la clé du succès — tu peux faire encore mieux !";
    } else if (completionRate >= 30) {
      motivationMessage = "Semaine difficile, mais tu es là. Chaque jour est une nouvelle opportunité de briller.";
    } else {
      motivationMessage = "Tout le monde a des semaines difficiles. Reprends de l'élan et lance-toi !";
    }

    // --- Navigation ---
    const prevWeekStart = new Date(start);
    prevWeekStart.setDate(start.getDate() - 7);
    const nextWeekStart = new Date(start);
    nextWeekStart.setDate(start.getDate() + 7);

    const now = new Date();
    const currentWeekParam = toWeekParam(now);
    const thisWeekParam = weekParam ?? toWeekParam(start);
    const isCurrentWeek = thisWeekParam === currentWeekParam;

    return NextResponse.json({
      success: true,
      data: {
        period: {
          start: start.toISOString(),
          end: end.toISOString(),
          label: `${start.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} — ${end.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`,
        },
        habits: {
          completionRate,
          totalCompleted,
          totalPossible,
          bestHabit: bestHabit
            ? { name: bestHabit.name, icon: bestHabit.icon, count: bestHabit.completions.length }
            : null,
        },
        expenses: {
          total: Math.round(totalExpenses * 100) / 100,
          budget: budgetWeekly,
          overBudget: budgetWeekly !== null ? totalExpenses > budgetWeekly : false,
          topCategories,
        },
        goals: goalsProgress,
        motivationMessage,
        dayByDay,
        xpThisWeek,
        score,
        grade,
        prevComparison,
        streakHighlights,
        navigation: {
          prevWeek: toWeekParam(prevWeekStart),
          nextWeek: toWeekParam(nextWeekStart),
          isCurrentWeek,
        },
      },
    });
  } catch (error) {
    console.error("[BILAN]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
