import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getLevelFromXp, XP_REWARDS } from "@/lib/gamification";
import { checkAndAwardBadges } from "@/lib/gamification-server";

const updateGoalSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  target: z.number().positive().optional(),
  current: z.number().min(0).optional(),
  unit: z.string().optional(),
  deadline: z.string().nullable().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const goal = await db.goal.findUnique({ where: { id } });
    if (!goal || goal.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Objectif introuvable" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateGoalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const wasCompleted = goal.current >= goal.target;

    const updated = await db.goal.update({
      where: { id },
      data: {
        ...parsed.data,
        deadline:
          parsed.data.deadline === null
            ? null
            : parsed.data.deadline
            ? new Date(parsed.data.deadline)
            : undefined,
      },
    });

    const isNowCompleted = updated.current >= updated.target;

    // Award XP if goal was just completed
    if (!wasCompleted && isNowCompleted) {
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { xp: true },
      });
      if (user) {
        const newXp = user.xp + XP_REWARDS.GOAL_REACHED;
        await db.user.update({
          where: { id: session.user.id },
          data: { xp: newXp, level: getLevelFromXp(newXp) },
        });
        await checkAndAwardBadges(session.user.id);
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[GOAL_PATCH]", error);
    return NextResponse.json({ success: false, error: "Erreur interne" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const goal = await db.goal.findUnique({ where: { id } });
    if (!goal || goal.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Objectif introuvable" }, { status: 404 });
    }

    await db.goal.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[GOAL_DELETE]", error);
    return NextResponse.json({ success: false, error: "Erreur interne" }, { status: 500 });
  }
}
