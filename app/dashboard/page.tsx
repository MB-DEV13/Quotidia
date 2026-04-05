import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getXpProgressForCurrentLevel, getLevelTitle, getStreakMultiplier } from "@/lib/gamification";
import { updateLoginStreak } from "@/lib/gamification-server";
import { getStartOfDay, getEndOfDay, getLast7Days, isHabitScheduledToday, getStartOfMonth, getEndOfMonth, formatCurrency } from "@/lib/utils";
import { AppShell } from "@/components/layout/AppShell";
import { HabitsSummary } from "@/components/dashboard/HabitsSummary";
import { XPBar } from "@/components/dashboard/XPBar";
import { StreakCard } from "@/components/dashboard/StreakCard";
import { WeeklyChart } from "@/components/charts/WeeklyChart";
import { AISuggestion } from "@/components/dashboard/AISuggestion";
import { ChatBubble } from "@/components/ai/ChatBubble";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { NextBadgeCard } from "@/components/dashboard/NextBadgeCard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  updateLoginStreak(session.user.id).catch(console.error);

  const today = new Date();
  const serverHour = today.getHours();
  const startOfDay = getStartOfDay(today);
  const endOfDay = getEndOfDay(today);
  const last7Days = getLast7Days();
  const weekStart = last7Days[0];
  const startOfMonth = getStartOfMonth(today);
  const endOfMonth = getEndOfMonth(today);

  // Toutes les requêtes DB en parallèle
  const [user, habits, goalsRaw, expensesLast7, expenses, budgetConfig, userBadges] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, level: true, xp: true, isPremium: true, aiRequestsUsed: true, aiRequestsReset: true, onboardingCompleted: true, loginStreak: true, country: true },
    }),
    db.habit.findMany({
      where: { userId: session.user.id, isArchived: false },
      include: { completions: { where: { date: { gte: weekStart } } } },
      orderBy: { createdAt: "asc" },
    }),
    db.goal.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
    db.expense.findMany({
      where: { userId: session.user.id, date: { gte: weekStart, lte: endOfDay } },
      select: { amount: true, date: true },
    }),
    db.expense.findMany({
      where: { userId: session.user.id, date: { gte: startOfMonth, lte: endOfMonth } },
      select: { amount: true },
    }),
    db.budgetConfig.findUnique({ where: { userId: session.user.id } }),
    db.userBadge.findMany({
      where: { userId: session.user.id },
      select: { badge: { select: { condition: true, name: true, icon: true, description: true } } },
      orderBy: { earnedAt: "desc" },
    }),
  ]);

  if (!user) redirect("/login");

  const habitsScheduledToday = habits.filter((h) => isHabitScheduledToday(h.frequency));
  const todayCompletions = habitsScheduledToday.filter((h) =>
    h.completions.some((c) => c.date >= startOfDay && c.date <= endOfDay)
  ).length;
  const allDoneToday = habitsScheduledToday.length > 0 && todayCompletions === habitsScheduledToday.length;
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.currentStreak), 0);
  const xpProgress = getXpProgressForCurrentLevel(user.xp);
  const levelTitle = getLevelTitle(user.level);
  const activeMultiplier = getStreakMultiplier(bestStreak);

  const allGoals = goalsRaw.map((g) => ({ current: g.current, target: g.target }));
  const completedGoalsCount = allGoals.filter((g) => g.current >= g.target).length;
  const goals = goalsRaw.filter((g) => g.current < g.target).slice(0, 3);
  const allCompleted = goalsRaw.length > 0 && completedGoalsCount === goalsRaw.length;
  const goalAvg = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + (g.target > 0 ? Math.min((g.current / g.target) * 100, 100) : 0), 0) / goals.length)
    : 0;

  const chartHabits = last7Days.map((day) => {
    const dayEnd = getEndOfDay(day);
    const completed = habits.filter((h) => h.completions.some((c) => c.date >= day && c.date <= dayEnd)).length;
    return {
      day: day.toLocaleDateString("fr-FR", { weekday: "short" }),
      completed,
      total: habitsScheduledToday.length,
      rate: habitsScheduledToday.length > 0 ? Math.round((completed / habitsScheduledToday.length) * 100) : 0,
      goalAvg,
    };
  });

  const weekCompletionRate = chartHabits.length > 0 && habitsScheduledToday.length > 0
    ? Math.round(chartHabits.reduce((sum, d) => sum + d.rate, 0) / chartHabits.length)
    : 0;

  const chartExpenses = last7Days.map((day) => {
    const dayEnd = getEndOfDay(day);
    const total = expensesLast7
      .filter((e) => e.date >= day && e.date <= dayEnd)
      .reduce((sum, e) => sum + e.amount, 0);
    return { day: day.toLocaleDateString("fr-FR", { weekday: "short" }), amount: Math.round(total * 100) / 100 };
  });

  const habitsToday = habitsScheduledToday.map((h) => ({
    ...h,
    completions: h.completions.filter((c) => c.date >= startOfDay && c.date <= endOfDay),
  }));

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const budget = budgetConfig?.incomeAmount ?? 0;
  const budgetWarning = budgetConfig?.monthlyBudget && budgetConfig.monthlyBudget > 0 ? budgetConfig.monthlyBudget : 0;
  const budgetRemaining = budget - totalExpenses;
  const budgetPct = budget > 0 ? Math.min(Math.round((totalExpenses / budget) * 100), 100) : 0;
  const isOverBudgetDash = budget > 0 && totalExpenses > budget;
  const isNearWarningDash = !isOverBudgetDash && budgetWarning > 0 && totalExpenses >= budgetWarning;
  const budgetColor = isOverBudgetDash ? "bg-danger" : isNearWarningDash ? "bg-warning" : "bg-success";
  const budgetTextColor = isOverBudgetDash ? "text-danger" : isNearWarningDash ? "text-warning" : "text-success";

  const earnedConditions = new Set(userBadges.map((ub) => ub.badge.condition));
  const totalCompletions = habits.reduce((sum, h) => sum + h.completions.length, 0);

  type NextBadge = { name: string; icon: string; description: string; progress: number; total: number };
  const candidates: (NextBadge | null)[] = [
    !earnedConditions.has("streak_7")   ? { name: "Semaine Parfaite",   icon: "🔥", description: "7 jours de streak",    progress: bestStreak, total: 7   } : null,
    !earnedConditions.has("streak_21")  ? { name: "Habitude Installée", icon: "💪", description: "21 jours de streak",   progress: bestStreak, total: 21  } : null,
    !earnedConditions.has("streak_30")  ? { name: "Mois de Feu",        icon: "🏆", description: "30 jours de streak",   progress: bestStreak, total: 30  } : null,
    !earnedConditions.has("completions_365") ? { name: "Machine",       icon: "🤖", description: "365 complétions",      progress: totalCompletions, total: 365 } : null,
    !earnedConditions.has("habits_5_active") && habits.length < 5 ? { name: "Multitâche", icon: "🎪", description: "5 habitudes actives", progress: habits.length, total: 5 } : null,
    !earnedConditions.has("first_goal") && completedGoalsCount < 1 ? { name: "Objectif Atteint", icon: "🎯", description: "1 objectif complété", progress: completedGoalsCount, total: 1 } : null,
    !earnedConditions.has("goals_3")    ? { name: "Persévérant",        icon: "🔥", description: "3 objectifs complétés", progress: completedGoalsCount, total: 3 } : null,
    !earnedConditions.has("login_4w")   ? { name: "Régularité",         icon: "📅", description: "4 semaines de connexion", progress: user.loginStreak, total: 4 } : null,
    !earnedConditions.has("login_12w")  ? { name: "Dédié",              icon: "🎯", description: "12 semaines de connexion", progress: user.loginStreak, total: 12 } : null,
  ];
  const nextBadge = candidates
    .filter((c): c is NextBadge => c !== null && c.progress < c.total)
    .sort((a, b) => (b.progress / b.total) - (a.progress / a.total))[0] ?? null;

  // Reset AI requests si nécessaire
  let aiRequestsUsed = user.aiRequestsUsed;
  if (!user.isPremium && user.aiRequestsReset) {
    const shouldReset = user.aiRequestsReset.getMonth() !== today.getMonth() || user.aiRequestsReset.getFullYear() !== today.getFullYear();
    if (shouldReset) {
      await db.user.update({ where: { id: session.user.id }, data: { aiRequestsUsed: 0, aiRequestsReset: today } });
      aiRequestsUsed = 0;
    }
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header — salutation dynamique */}
        <DashboardHeader
          name={user.name}
          serverHour={serverHour}
          isPremium={user.isPremium}
          dateLabel={today.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
        />

        {/* Alerte streak en danger (après 17h si habitudes non complétées) */}
        {serverHour >= 17 && !allDoneToday && habitsScheduledToday.length > 0 && (
          <div className="mb-6 bg-warning/10 border border-warning/30 rounded-2xl px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-warning">Streak en danger !</p>
              <p className="text-xs text-warning/80">
                Il te reste {habitsScheduledToday.length - todayCompletions} habitude{habitsScheduledToday.length - todayCompletions > 1 ? "s" : ""} à valider avant minuit pour garder ton streak.
              </p>
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Habitudes du jour — avec barre de progression */}
          <div className="bg-white rounded-2xl shadow-soft p-4">
            <p className="text-textLight text-xs mb-1">Aujourd'hui</p>
            <p className="text-2xl font-bold text-textDark">
              {todayCompletions}
              <span className="text-textLight text-base font-normal">/{habitsScheduledToday.length}</span>
            </p>
            {habitsScheduledToday.length > 0 && (
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${allDoneToday ? "bg-success" : "bg-primary"}`}
                  style={{ width: `${habitsScheduledToday.length > 0 ? Math.round((todayCompletions / habitsScheduledToday.length) * 100) : 0}%` }}
                />
              </div>
            )}
            {weekCompletionRate > 0 && (
              <p className="text-xs text-textLight mt-1.5">{weekCompletionRate}% cette semaine</p>
            )}
          </div>
          <StreakCard streak={bestStreak} />
          <div className="bg-white rounded-2xl shadow-soft p-4">
            <p className="text-textLight text-xs mb-1">Niveau</p>
            <p className="text-2xl font-bold text-primary">
              {user.level}{" "}
              <span className="text-sm font-normal text-textLight">{levelTitle}</span>
            </p>
            {activeMultiplier > 1 && (
              <p className="text-xs font-bold text-warning mt-1">🔥 ×{activeMultiplier} XP</p>
            )}
          </div>
        </div>

        {/* XP Bar */}
        <div className="mb-6">
          <XPBar
            current={xpProgress.current}
            needed={xpProgress.needed}
            percentage={xpProgress.percentage}
            level={user.level}
            earnedBadges={userBadges.map((ub) => ({ name: ub.badge.name, icon: ub.badge.icon, description: ub.badge.description }))}
          />
        </div>

        {/* AI Tip — chargement en streaming, ne bloque pas le rendu */}
        <div className="mb-6">
          <Suspense fallback={
            <div className="bg-white rounded-2xl shadow-soft p-5 border-l-4 border-ai animate-pulse">
              <div className="h-3 bg-gray-100 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-full mb-2" />
              <div className="h-3 bg-gray-100 rounded w-4/5" />
            </div>
          }>
            <AISuggestion userId={session.user.id} hasHabits={habits.length > 0} />
          </Suspense>
        </div>

        {/* Habitudes du jour — remonté ici */}
        <div className="mb-6">
          <HabitsSummary habits={habitsToday} />
        </div>

        {/* Prochain badge */}
        {nextBadge && (
          <div className="mb-6">
            <NextBadgeCard badge={nextBadge} />
          </div>
        )}

        {/* Budget */}
        {budgetConfig !== null ? (
          <div className="mb-6">
            <div className="bg-white rounded-2xl shadow-soft p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-textDark">Budget ce mois</p>
                <Link href="/budget" className="text-xs text-primary hover:underline">Voir tout →</Link>
              </div>
              <div className="flex items-end gap-2 mb-2">
                <span className={`text-2xl font-bold ${budgetTextColor}`}>{formatCurrency(totalExpenses)}</span>
                <span className="text-xs text-textLight mb-1">/ {formatCurrency(budget)}</span>
                <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${budgetPct >= 80 ? "bg-danger/10 text-danger" : budgetPct >= 50 ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}`}>
                  {budgetPct}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${budgetColor}`} style={{ width: `${budgetPct}%` }} />
              </div>
              <p className={`text-xs mt-1.5 ${budgetRemaining < 0 ? "text-danger font-semibold" : "text-textLight"}`}>
                {budgetRemaining < 0 ? `⚠️ Dépassement de ${formatCurrency(Math.abs(budgetRemaining))}` : `${formatCurrency(budgetRemaining)} restants`}
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <Link href="/budget" className="block bg-white rounded-2xl shadow-soft p-5 hover:shadow-card transition border-2 border-dashed border-gray-200 hover:border-primary/30 text-center group">
              <p className="text-2xl mb-2">💰</p>
              <p className="text-sm font-semibold text-textDark group-hover:text-primary transition">Configure ton budget</p>
              <p className="text-xs text-textLight mt-1">Suis tes dépenses et reste dans le vert chaque mois.</p>
              <span className="inline-block mt-3 text-xs text-primary font-semibold">Commencer →</span>
            </Link>
          </div>
        )}

        {/* Objectifs */}
        {allCompleted ? (
          /* Tous les objectifs sont complétés */
          <div className="mb-6 bg-white rounded-2xl shadow-soft p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-textDark">Objectifs</h2>
              <Link href="/goals" className="text-xs text-primary hover:underline">Voir tout →</Link>
            </div>
            <div className="text-center py-3">
              <p className="text-3xl mb-2">🎉</p>
              <p className="text-sm font-bold text-success mb-1">Félicitations !</p>
              <p className="text-xs text-textLight mb-4">Tu as complété tous tes objectifs. C&apos;est une vraie performance !</p>
              <Link
                href="/goals"
                className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-primary/90 transition"
              >
                <span>+</span> Nouvel objectif
              </Link>
            </div>
          </div>
        ) : goals.length > 0 ? (
          /* Objectifs actifs à afficher */
          <div className="mb-6 bg-white rounded-2xl shadow-soft p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-textDark">Objectifs en cours</h2>
              <Link href="/goals" className="text-xs text-primary hover:underline">Voir tout →</Link>
            </div>
            <div className="space-y-3">
              {goals.map((goal) => {
                const pct = goal.target > 0 ? Math.min(Math.round((goal.current / goal.target) * 100), 100) : 0;
                return (
                  <div key={goal.id}>
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base shrink-0">{(goal as { icon?: string }).icon ?? "🎯"}</span>
                        <p className="text-sm font-medium text-textDark truncate">{goal.title}</p>
                      </div>
                      <span className="text-xs font-semibold text-primary ml-2 shrink-0">{pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%`, backgroundColor: (goal as { color?: string }).color ?? "#5B5EA6" }} />
                    </div>
                    <p className="text-xs text-textLight mt-1">{goal.current} / {goal.target} {goal.unit ?? ""}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Aucun objectif actif */
          <div className="mb-6">
            <Link href="/goals" className="block bg-white rounded-2xl shadow-soft p-5 hover:shadow-card transition border-2 border-dashed border-gray-200 hover:border-primary/30 text-center group">
              <p className="text-2xl mb-2">🎯</p>
              <p className="text-sm font-semibold text-textDark group-hover:text-primary transition">Crée ton premier objectif</p>
              <p className="text-xs text-textLight mt-1">Définis une cible et suis ta progression jour après jour.</p>
              <span className="inline-block mt-3 text-xs text-primary font-semibold">Commencer →</span>
            </Link>
          </div>
        )}

        {/* Graphique switchable */}
        {habits.length > 0 && (
          <div className="mb-6">
            <WeeklyChart habitsData={chartHabits} expensesData={chartExpenses} />
          </div>
        )}

      </div>

      <ChatBubble aiRequestsUsed={aiRequestsUsed} isPremium={user.isPremium} />
      <OnboardingModal isOpen={!user.onboardingCompleted} needsProfile={!user.country} />
    </AppShell>
  );
}
