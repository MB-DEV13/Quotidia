import { db } from "@/lib/db";
import {
  XP_REWARDS,
  getLevelFromXp,
  getCurrentISOWeek,
  getPreviousISOWeek,
} from "@/lib/gamification";

export async function checkAndAwardBadges(userId: string): Promise<{ name: string; icon: string }[]> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        xp: true,
        loginStreak: true,
        habits: {
          where: { isArchived: false },
          select: {
            currentStreak: true,
            completions: {
              select: { id: true, date: true },
              orderBy: { date: "desc" },
            },
          },
        },
        goals: { select: { current: true, target: true, createdAt: true } },
        expenses: { select: { amount: true, date: true } },
        badges: { select: { badge: { select: { condition: true } } } },
      },
    });

    if (!user) return [];

    const earned = new Set(user.badges.map((b) => b.badge.condition));
    const toCheck: string[] = [];

    const totalCompletions = user.habits.reduce((sum, h) => sum + h.completions.length, 0);
    const maxStreak = user.habits.reduce((max, h) => Math.max(max, h.currentStreak), 0);
    const activeHabits = user.habits.length;

    if (totalCompletions >= 1 && !earned.has("first_habit")) toCheck.push("first_habit");
    if (maxStreak >= 7 && !earned.has("streak_7")) toCheck.push("streak_7");
    if (maxStreak >= 21 && !earned.has("streak_21")) toCheck.push("streak_21");
    if (maxStreak >= 30 && !earned.has("streak_30")) toCheck.push("streak_30");
    if (totalCompletions >= 365 && !earned.has("completions_365")) toCheck.push("completions_365");
    if (activeHabits >= 5 && !earned.has("habits_5_active")) toCheck.push("habits_5_active");

    if (!earned.has("perfect_week") && user.habits.length > 0) {
      const today = new Date();
      let perfectDays = 0;
      for (let i = 0; i < 7; i++) {
        const day = new Date(today);
        day.setDate(day.getDate() - i);
        const dayStr = day.toISOString().slice(0, 10);
        const allCompleted = user.habits.every((h) =>
          h.completions.some((c) => new Date(c.date).toISOString().slice(0, 10) === dayStr)
        );
        if (allCompleted) perfectDays++;
        else break;
      }
      if (perfectDays >= 7) toCheck.push("perfect_week");
    }

    const completedGoals = user.goals.filter((g) => g.current >= g.target).length;
    const hasAnyGoal = user.goals.length > 0;

    if (hasAnyGoal && !earned.has("first_goal_created")) toCheck.push("first_goal_created");
    if (completedGoals >= 1 && !earned.has("first_goal")) toCheck.push("first_goal");
    if (completedGoals >= 3 && !earned.has("goals_3")) toCheck.push("goals_3");
    if (completedGoals >= 5 && !earned.has("goals_5")) toCheck.push("goals_5");
    if (completedGoals >= 10 && !earned.has("goals_10")) toCheck.push("goals_10");

    const budgetConditions: [number, string][] = [
      [1, "budget_1m"], [3, "budget_3m"], [6, "budget_6m"],
      [8, "budget_8m"], [10, "budget_10m"], [12, "budget_12m"],
    ];
    const expenseByMonth = new Map<string, number>();
    for (const e of user.expenses) {
      const key = new Date(e.date).toISOString().slice(0, 7);
      expenseByMonth.set(key, (expenseByMonth.get(key) ?? 0) + e.amount);
    }
    const budgetConfig = await db.budgetConfig.findUnique({
      where: { userId },
      select: { monthlyBudget: true },
    });
    if (budgetConfig?.monthlyBudget) {
      let greenMonths = 0;
      const now = new Date();
      for (let i = 1; i <= 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toISOString().slice(0, 7);
        const spent = expenseByMonth.get(key) ?? null;
        if (spent !== null && spent <= budgetConfig.monthlyBudget) {
          greenMonths++;
        } else if (spent !== null) {
          break;
        }
      }
      for (const [months, condition] of budgetConditions) {
        if (greenMonths >= months && !earned.has(condition)) toCheck.push(condition);
      }
    }

    const loginStreak = user.loginStreak;
    if (loginStreak >= 1 && !earned.has("login_1w")) toCheck.push("login_1w");
    if (loginStreak >= 4 && !earned.has("login_4w")) toCheck.push("login_4w");
    if (loginStreak >= 12 && !earned.has("login_12w")) toCheck.push("login_12w");
    if (loginStreak >= 52 && !earned.has("login_52w")) toCheck.push("login_52w");

    if (toCheck.length === 0) return [];

    const badgesToAward = await db.badge.findMany({
      where: { condition: { in: toCheck } },
    });

    const newBadges: { name: string; icon: string }[] = [];
    let xpBonus = 0;
    for (const badge of badgesToAward) {
      await db.userBadge.upsert({
        where: { userId_badgeId: { userId, badgeId: badge.id } },
        create: { userId, badgeId: badge.id },
        update: {},
      });
      xpBonus += badge.xpReward;
      newBadges.push({ name: badge.name, icon: badge.icon });
    }

    if (xpBonus > 0) {
      const newXp = user.xp + xpBonus;
      await db.user.update({
        where: { id: userId },
        data: { xp: newXp, level: getLevelFromXp(newXp) },
      });
    }

    return newBadges;
  } catch (error) {
    console.error("[CHECK_BADGES]", error);
    return [];
  }
}

export async function updateLoginStreak(userId: string): Promise<void> {
  try {
    const currentWeek = getCurrentISOWeek();
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { loginStreak: true, lastLoginWeek: true, xp: true },
    });
    if (!user) return;

    if (user.lastLoginWeek === currentWeek) return;

    const prevWeek = getPreviousISOWeek(currentWeek);
    const newStreak = user.lastLoginWeek === prevWeek ? user.loginStreak + 1 : 1;
    const newXp = user.xp + XP_REWARDS.LOGIN_WEEKLY;

    await db.user.update({
      where: { id: userId },
      data: {
        loginStreak: newStreak,
        lastLoginWeek: currentWeek,
        xp: newXp,
        level: getLevelFromXp(newXp),
      },
    });

    checkAndAwardBadges(userId).catch(console.error);
  } catch (error) {
    console.error("[LOGIN_STREAK]", error);
  }
}
