import { db } from "@/lib/db";
import { getStartOfMonth, getEndOfMonth, getStartOfDay, getEndOfDay } from "@/lib/utils";

export async function generateUserContext(userId: string): Promise<string> {
  const today = new Date();
  const startOfToday = getStartOfDay(today);
  const endOfToday = getEndOfDay(today);
  const startOfMonth = getStartOfMonth(today);
  const endOfMonth = getEndOfMonth(today);

  // Last 7 days for habits
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [user, habits, expenses, goals] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { name: true, level: true, xp: true, isPremium: true },
    }),
    db.habit.findMany({
      where: { userId, isArchived: false },
      include: {
        completions: {
          where: { date: { gte: sevenDaysAgo } },
        },
      },
    }),
    db.expense.findMany({
      where: {
        userId,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
    }),
    db.goal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  if (!user) return "";

  const lines: string[] = [];

  lines.push(`Utilisateur: ${user.name ?? "Inconnu"}, Niveau ${user.level}, ${user.xp} XP`);

  // Habits summary
  if (habits.length > 0) {
    const todayCompletions = habits.filter((h) =>
      h.completions.some((c) => c.date >= startOfToday && c.date <= endOfToday)
    ).length;

    const bestStreak = habits.reduce((max, h) => Math.max(max, h.currentStreak), 0);

    const habitsSummary = habits
      .slice(0, 5)
      .map((h) => {
        const completedLast7 = h.completions.length;
        return `${h.name}(streak:${h.currentStreak}, 7j:${completedLast7}/7)`;
      })
      .join(", ");

    lines.push(`Habitudes (${habits.length} actives): ${habitsSummary}`);
    lines.push(`Aujourd'hui: ${todayCompletions}/${habits.length} habitudes complétées. Meilleur streak: ${bestStreak}j`);
  } else {
    lines.push("Aucune habitude active.");
  }

  // Budget summary
  if (expenses.length > 0) {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const categoryMap = new Map<string, number>();
    for (const e of expenses) {
      categoryMap.set(e.category, (categoryMap.get(e.category) ?? 0) + e.amount);
    }
    const topCategories = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat, amt]) => `${cat}:${amt.toFixed(0)}€`)
      .join(", ");
    lines.push(`Budget ce mois: ${total.toFixed(0)}€ dépensés. Top catégories: ${topCategories}`);
  } else {
    lines.push("Aucune dépense ce mois.");
  }

  // Goals summary
  if (goals.length > 0) {
    const goalsSummary = goals
      .slice(0, 3)
      .map((g) => {
        const pct = g.target > 0 ? Math.round((g.current / g.target) * 100) : 0;
        return `"${g.title}"(${g.current}/${g.target}${g.unit ? " " + g.unit : ""}, ${pct}%)`;
      })
      .join(", ");
    lines.push(`Objectifs: ${goalsSummary}`);
  } else {
    lines.push("Aucun objectif défini.");
  }

  return lines.join("\n");
}
