import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { rateLimitAsync } from "@/lib/rate-limit";

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

    const { allowed } = await rateLimitAsync(`export-bilan:${session.user.id}`, 10, 60 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json({ success: false, error: "Trop de requêtes. Réessaie dans 1 heure." }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") === "weekly" ? "weekly" : "monthly";

    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (type === "weekly") {
      // Calcul en UTC pour éviter les décalages timezone serveur vs client
      const dayOfWeek = now.getUTCDay() || 7; // 1=lundi ... 7=dimanche
      startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - dayOfWeek + 1));
      endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - dayOfWeek + 7, 23, 59, 59, 999));
    } else {
      startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
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
