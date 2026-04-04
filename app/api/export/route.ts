import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { isPremium: true },
    });

    if (!user?.isPremium) {
      return NextResponse.json(
        { success: false, error: "Fonctionnalité réservée aux membres Premium" },
        { status: 403 }
      );
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const [habits, expenses, goals] = await Promise.all([
      db.habit.findMany({
        where: { userId: session.user.id },
        include: {
          completions: {
            where: { date: { gte: thirtyDaysAgo } },
            orderBy: { date: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
      db.expense.findMany({
        where: {
          userId: session.user.id,
          date: { gte: threeMonthsAgo },
        },
        orderBy: { date: "desc" },
      }),
      db.goal.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const lines: string[] = [];

    // En-tête
    lines.push("Quotidia — Export de données");
    lines.push(`Exporté le: ${now.toLocaleDateString("fr-FR")}`);
    lines.push("");

    // Section habitudes
    lines.push("=== HABITUDES ===");
    lines.push("Nom,Icône,Fréquence,Streak actuel,Meilleur streak,Archivée,Créée le");
    for (const habit of habits) {
      lines.push(
        [
          `"${habit.name}"`,
          `"${habit.icon ?? ""}"`,
          `"${habit.frequency}"`,
          habit.currentStreak,
          habit.bestStreak,
          habit.isArchived ? "Oui" : "Non",
          `"${new Date(habit.createdAt).toLocaleDateString("fr-FR")}"`,
        ].join(",")
      );
    }
    lines.push("");

    // Section complétions habitudes (30 derniers jours)
    lines.push("=== COMPLÉTIONS HABITUDES (30 derniers jours) ===");
    lines.push("Habitude,Date");
    for (const habit of habits) {
      for (const completion of habit.completions) {
        lines.push(
          [
            `"${habit.name}"`,
            `"${new Date(completion.date).toLocaleDateString("fr-FR")}"`,
          ].join(",")
        );
      }
    }
    lines.push("");

    // Section dépenses
    lines.push("=== DÉPENSES (3 derniers mois) ===");
    lines.push("Montant,Catégorie,Description,Date");
    for (const expense of expenses) {
      lines.push(
        [
          expense.amount.toFixed(2),
          `"${expense.category}"`,
          `"${expense.label ?? ""}"`,
          `"${new Date(expense.date).toLocaleDateString("fr-FR")}"`,
        ].join(",")
      );
    }
    lines.push("");

    // Section objectifs
    lines.push("=== OBJECTIFS ===");
    lines.push("Titre,Cible,Actuel,Unité,Échéance,Progression,Créé le");
    for (const goal of goals) {
      const pct =
        goal.target > 0
          ? Math.min(Math.round((goal.current / goal.target) * 100), 100)
          : 0;
      lines.push(
        [
          `"${goal.title}"`,
          goal.target,
          goal.current,
          `"${goal.unit ?? ""}"`,
          goal.deadline
            ? `"${new Date(goal.deadline).toLocaleDateString("fr-FR")}"`
            : `""`,
          `${pct}%`,
          `"${new Date(goal.createdAt).toLocaleDateString("fr-FR")}"`,
        ].join(",")
      );
    }

    const csv = lines.join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="quotidia-export-${now.toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    console.error("[EXPORT]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
