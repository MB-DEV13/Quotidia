import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStartOfDay, getEndOfDay } from "@/lib/utils";
import { getLevelFromXp, XP_REWARDS } from "@/lib/gamification";
import { FREE_LIMITS } from "@/lib/constants";

const createHabitSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100),
  icon: z.string().optional(),
  color: z.string().default("#5B5EA6"),
  frequency: z
    .string()
    .refine(
      (v) =>
        v === "daily" ||
        /^days:[1-7](,[1-7])*$/.test(v) ||
        /^once:\d{4}-\d{2}-\d{2}$/.test(v),
      { message: "Fréquence invalide" }
    )
    .default("daily"),
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const today = new Date();
    const startOfDay = getStartOfDay(today);
    const endOfDay = getEndOfDay(today);

    const habits = await db.habit.findMany({
      where: { userId: session.user.id, isArchived: false },
      include: {
        completions: {
          where: { date: { gte: startOfDay, lte: endOfDay } },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, data: habits });
  } catch (error) {
    console.error("[HABITS_GET]", error);
    return NextResponse.json({ success: false, error: "Erreur interne" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createHabitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // Enforce freemium limit
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { isPremium: true, habits: { where: { isArchived: false }, select: { id: true } } },
    });

    if (!user?.isPremium && (user?.habits.length ?? 0) >= FREE_LIMITS.HABITS) {
      return NextResponse.json(
        { success: false, error: "Limite de 3 habitudes atteinte. Passe en Premium pour en ajouter plus." },
        { status: 403 }
      );
    }

    const habit = await db.habit.create({
      data: {
        ...parsed.data,
        userId: session.user.id,
      },
    });

    // Award XP for first habit
    if (user && user.habits.length === 0) {
      const fullUser = await db.user.findUnique({
        where: { id: session.user.id },
        select: { xp: true },
      });
      if (fullUser) {
        const newXp = fullUser.xp + XP_REWARDS.HABIT_COMPLETE;
        await db.user.update({
          where: { id: session.user.id },
          data: { xp: newXp, level: getLevelFromXp(newXp) },
        });
      }
    }

    return NextResponse.json({ success: true, data: habit }, { status: 201 });
  } catch (error) {
    console.error("[HABITS_POST]", error);
    return NextResponse.json({ success: false, error: "Erreur interne" }, { status: 500 });
  }
}
