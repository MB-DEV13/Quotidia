import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { BADGES } from "@/lib/gamification";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const userBadges = await db.userBadge.findMany({
      where: { userId: session.user.id },
      include: { badge: true },
      orderBy: { earnedAt: "desc" },
    });

    const earnedConditions = new Set(userBadges.map((ub) => ub.badge.condition));

    const allBadges = BADGES.map((badge) => ({
      ...badge,
      earned: earnedConditions.has(badge.condition),
      earnedAt: userBadges.find((ub) => ub.badge.condition === badge.condition)?.earnedAt ?? null,
    }));

    return NextResponse.json({ success: true, data: allBadges });
  } catch (error) {
    console.error("[BADGES_GET]", error);
    return NextResponse.json({ success: false, error: "Erreur interne" }, { status: 500 });
  }
}
