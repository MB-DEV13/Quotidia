import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getResend, FROM_EMAIL } from "@/lib/resend";
import { weeklyReportHtml } from "@/lib/email-templates";

function getLastWeekBounds(): { start: Date; end: Date; label: string } {
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7; // Monday = 0
  const thisMonday = new Date(now);
  thisMonday.setDate(now.getDate() - dayOfWeek);
  thisMonday.setHours(0, 0, 0, 0);

  const lastMonday = new Date(thisMonday);
  lastMonday.setDate(thisMonday.getDate() - 7);

  const lastSunday = new Date(lastMonday);
  lastSunday.setDate(lastMonday.getDate() + 6);
  lastSunday.setHours(23, 59, 59, 999);

  const fmt = (d: Date) =>
    d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  const label = `${fmt(lastMonday)} – ${fmt(lastSunday)} ${lastSunday.getFullYear()}`;

  return { start: lastMonday, end: lastSunday, label };
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ success: false, error: "RESEND_API_KEY non configurée" }, { status: 503 });
    }

    const { start, end, label } = getLastWeekBounds();

    const [user, habits, expenses, goals, budgetConfig] = await Promise.all([
      db.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true, xp: true, level: true, isPremium: true },
      }),
      db.habit.findMany({
        where: { userId: session.user.id, isArchived: false },
        include: { completions: { where: { date: { gte: start, lte: end } } } },
      }),
      db.expense.findMany({
        where: { userId: session.user.id, date: { gte: start, lte: end } },
        select: { amount: true, category: true },
      }),
      db.goal.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      db.budgetConfig.findUnique({ where: { userId: session.user.id } }),
    ]);

    if (!user) {
      return NextResponse.json({ success: false, error: "Utilisateur introuvable" }, { status: 404 });
    }

    // Calculs habitudes
    const totalPossible = habits.length * 7;
    const totalCompleted = habits.reduce((sum, h) => sum + h.completions.length, 0);
    const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
    const bestHabit = habits.reduce<(typeof habits)[0] | null>(
      (best, h) => (h.completions.length > (best?.completions.length ?? -1) ? h : best),
      null
    );
    const bestStreak = habits.reduce((max, h) => Math.max(max, h.currentStreak), 0);

    // Budget
    const budgetTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
    const monthlyBudget = budgetConfig?.monthlyBudget ?? budgetConfig?.incomeAmount ?? null;
    const budgetWeekly = monthlyBudget ? Math.round((monthlyBudget / 4) * 100) / 100 : null;

    // Objectifs
    const goalsProgress = goals.map((g) => ({
      title: g.title,
      pct: g.target > 0 ? Math.min(Math.round((g.current / g.target) * 100), 100) : 0,
    }));

    // XP gagné cette semaine (approximation : complétion * 10 XP)
    const xpGained = totalCompleted * 10;

    // Message motivant
    let motivationMessage = "Continue sur ta lancée !";
    if (completionRate >= 90) motivationMessage = "Semaine exceptionnelle ! Tu es une vraie machine. Continue sur cette lancée !";
    else if (completionRate >= 70) motivationMessage = "Belle semaine ! Tu progresses bien. Encore un petit effort pour atteindre la perfection.";
    else if (completionRate >= 50) motivationMessage = "Semaine correcte. La régularité est la clé du succès — tu peux faire encore mieux !";
    else motivationMessage = "Tout le monde a des semaines difficiles. Reprends de l'élan et lance-toi !";

    const appUrl = process.env.NEXTAUTH_URL ?? "https://myquotidia.app";

    const html = weeklyReportHtml({
      userName: user.name ?? "Champion",
      weekLabel: label,
      completionRate,
      totalCompleted,
      totalPossible,
      bestHabit: bestHabit
        ? { name: bestHabit.name, icon: bestHabit.icon, count: bestHabit.completions.length }
        : null,
      bestStreak,
      xpGained,
      budgetTotal,
      budgetLimit: budgetWeekly,
      goalsProgress,
      motivationMessage,
      appUrl,
    });

    const resend = getResend();
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: `📊 Ton bilan de la semaine — ${label}`,
      html,
    });

    if (error) {
      console.error("[EMAIL_HEBDO]", error);
      return NextResponse.json({ success: false, error: "Erreur envoi email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { sent: true, to: user.email } });
  } catch (err) {
    console.error("[EMAIL_HEBDO]", err);
    return NextResponse.json({ success: false, error: "Erreur interne" }, { status: 500 });
  }
}
