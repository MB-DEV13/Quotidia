import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getLevelFromXp, XP_REWARDS } from "@/lib/gamification";
import { checkAndAwardBadges } from "@/lib/gamification-server";
import { FREE_LIMITS } from "@/lib/constants";

const createGoalSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(100),
  icon: z.string().optional(),
  color: z.string().optional(),
  target: z.number().positive("La valeur cible doit être positive"),
  current: z.number().min(0).default(0),
  unit: z.string().optional(),
  deadline: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const goals = await db.goal.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: goals });
  } catch (error) {
    console.error("[GOALS_GET]", error);
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
    const parsed = createGoalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        isPremium: true,
        xp: true,
        goals: { select: { id: true } },
      },
    });

    if (!user?.isPremium && (user?.goals.length ?? 0) >= FREE_LIMITS.GOALS) {
      return NextResponse.json(
        { success: false, error: "Limite de 2 objectifs atteinte. Passe en Premium pour en ajouter plus." },
        { status: 403 }
      );
    }

    const goal = await db.goal.create({
      data: {
        userId: session.user.id,
        title: parsed.data.title,
        icon: parsed.data.icon ?? "🎯",
        color: parsed.data.color ?? "#5B5EA6",
        target: parsed.data.target,
        current: parsed.data.current,
        unit: parsed.data.unit,
        deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : undefined,
      },
    });

    // Award XP if goal is immediately completed
    if (goal.current >= goal.target && user) {
      const newXp = user.xp + XP_REWARDS.GOAL_REACHED;
      await db.user.update({
        where: { id: session.user.id },
        data: { xp: newXp, level: getLevelFromXp(newXp) },
      });
      await checkAndAwardBadges(session.user.id);
    }

    return NextResponse.json({ success: true, data: goal }, { status: 201 });
  } catch (error) {
    console.error("[GOALS_POST]", error);
    return NextResponse.json({ success: false, error: "Erreur interne" }, { status: 500 });
  }
}
