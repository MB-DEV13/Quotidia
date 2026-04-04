import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getResend, FROM_EMAIL } from "@/lib/resend";
import { monthlyReportHtml } from "@/lib/email-templates";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ success: false, error: "RESEND_API_KEY non configurée" }, { status: 503 });
    }

    // Dernier mois complet
    const now = new Date();
    const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const lastOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const monthLabel = firstOfLastMonth.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

    const [user, habits, expenses, goals, userBadges, budgetConfig] = await Promise.all([
      db.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true, xp: true, level: true, isPremium: true },
      }),
      db.habit.findMany({
        where: { userId: session.user.id, isArchived: false },
        include: { completions: { where: { date: { gte: firstOfLastMonth, lte: lastOfLastMonth } } } },
      }),
      db.expense.findMany({
        where: { userId: session.user.id, date: { gte: firstOfLastMonth, lte: lastOfLastMonth } },
        select: { amount: true, category: true },
      }),
      db.goal.findMany({ where: { userId: session.user.id } }),
      db.userBadge.findMany({
        where: { userId: session.user.id, earnedAt: { gte: firstOfLastMonth, lte: lastOfLastMonth } },
        include: { badge: { select: { name: true, icon: true } } },
      }),
      db.budgetConfig.findUnique({ where: { userId: session.user.id } }),
    ]);

    if (!user) {
      return NextResponse.json({ success: false, error: "Utilisateur introuvable" }, { status: 404 });
    }

    // Habitudes
    const daysInMonth = lastOfLastMonth.getDate();
    const totalPossible = habits.length * daysInMonth;
    const totalCompleted = habits.reduce((sum, h) => sum + h.completions.length, 0);
    const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
    const bestStreak = habits.reduce((max, h) => Math.max(max, h.bestStreak), 0);

    // Budget
    const budgetTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
    const monthlyBudget = budgetConfig?.monthlyBudget ?? budgetConfig?.incomeAmount ?? null;

    // Top category
    const categoryMap = new Map<string, number>();
    for (const e of expenses) {
      categoryMap.set(e.category, (categoryMap.get(e.category) ?? 0) + e.amount);
    }
    const topCategoryEntry = Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1])[0];
    const topCategory = topCategoryEntry ? { name: topCategoryEntry[0], amount: topCategoryEntry[1] } : null;

    // Objectifs
    const goalsCompleted = goals.filter((g) => g.current >= g.target).length;

    // Badges ce mois
    const badgesEarned = userBadges.map((ub) => ({ name: ub.badge.name, icon: ub.badge.icon }));

    // Message motivant
    let motivationMessage = "Un mois de plus de progressé — continue !";
    if (completionRate >= 85) motivationMessage = `Mois exceptionnel avec ${completionRate}% de complétion ! Tu es une vraie inspiration. Garde cette dynamique en ${now.toLocaleDateString("fr-FR", { month: "long" })} !`;
    else if (completionRate >= 65) motivationMessage = `Bon mois ! Tu as maintenu ${completionRate}% de tes habitudes. Vise les 80% le mois prochain !`;
    else motivationMessage = `Chaque mois est une nouvelle opportunité. Tu as posé ${totalCompleted} habitudes — construis dessus le mois prochain !`;

    const appUrl = process.env.NEXTAUTH_URL ?? "https://myquotidia.app";

    const html = monthlyReportHtml({
      userName: user.name ?? "Champion",
      monthLabel,
      completionRate,
      totalCompleted,
      totalPossible,
      bestStreak,
      totalXp: user.xp,
      level: user.level,
      budgetTotal,
      budgetLimit: monthlyBudget,
      topCategory,
      goalsCompleted,
      goalsTotal: goals.length,
      badgesEarned,
      motivationMessage,
      appUrl,
    });

    const resend = getResend();
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: `🗓️ Ton bilan de ${monthLabel} — Quotidia`,
      html,
    });

    if (error) {
      console.error("[EMAIL_MENSUEL]", error);
      return NextResponse.json({ success: false, error: "Erreur envoi email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { sent: true, to: user.email } });
  } catch (err) {
    console.error("[EMAIL_MENSUEL]", err);
    return NextResponse.json({ success: false, error: "Erreur interne" }, { status: 500 });
  }
}
