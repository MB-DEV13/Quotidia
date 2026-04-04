import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStartOfDay, getEndOfDay } from "@/lib/utils";
import { XP_REWARDS, getLevelFromXp, getStreakMultiplier } from "@/lib/gamification";
import { checkAndAwardBadges } from "@/lib/gamification-server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const habit = await db.habit.findUnique({
      where: { id },
      include: {
        completions: {
          orderBy: { date: "desc" },
          take: 31,
        },
      },
    });

    if (!habit || habit.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Habitude introuvable" }, { status: 404 });
    }

    const today = new Date();
    const startOfDay = getStartOfDay(today);
    const endOfDay = getEndOfDay(today);

    const alreadyCompleted = habit.completions.some(
      (c) => c.date >= startOfDay && c.date <= endOfDay
    );

    if (alreadyCompleted) {
      return NextResponse.json(
        { success: false, error: "Déjà complété aujourd'hui" },
        { status: 409 }
      );
    }

    await db.habitCompletion.create({
      data: { habitId: id, date: startOfDay },
    });

    // Calculate new streak
    const yesterday = new Date(startOfDay);
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfYesterday = getStartOfDay(yesterday);
    const endOfYesterday = getEndOfDay(yesterday);

    const completedYesterday = habit.completions.some(
      (c) => c.date >= startOfYesterday && c.date <= endOfYesterday
    );

    const newStreak = completedYesterday ? habit.currentStreak + 1 : 1;
    const newBestStreak = Math.max(newStreak, habit.bestStreak);

    await db.habit.update({
      where: { id },
      data: { currentStreak: newStreak, bestStreak: newBestStreak },
    });

    // Award XP
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { xp: true },
    });

    if (user) {
      // Multiplicateur streak : x1.5 (7j) → x2 (14j) → x2.5 (30j)
      const multiplier = getStreakMultiplier(newStreak);
      let xpGain = Math.round(XP_REWARDS.HABIT_COMPLETE * multiplier);

      // Bonus streak milestone (en plus du multiplicateur)
      if (newStreak === 7) xpGain += XP_REWARDS.STREAK_7;
      if (newStreak === 30) xpGain += XP_REWARDS.STREAK_30;

      const newXp = user.xp + xpGain;
      const updatedUser = await db.user.update({
        where: { id: session.user.id },
        data: { xp: newXp, level: getLevelFromXp(newXp) },
        select: { xp: true, level: true },
      });

      const newBadges = await checkAndAwardBadges(session.user.id);

      return NextResponse.json({
        success: true,
        data: { streak: newStreak, xpGained: xpGain, multiplier, user: updatedUser, newBadges },
      });
    }

    return NextResponse.json({ success: true, data: { streak: newStreak } });
  } catch (error) {
    console.error("[HABIT_COMPLETE]", error);
    return NextResponse.json({ success: false, error: "Erreur interne" }, { status: 500 });
  }
}
