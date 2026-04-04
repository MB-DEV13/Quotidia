import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country") ?? undefined;
    const region = searchParams.get("region") ?? undefined;

    const users = await db.user.findMany({
      where: {
        showInLeaderboard: true,
        ...(country ? { country } : {}),
        ...(region ? { region } : {}),
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        level: true,
        xp: true,
        country: true,
        region: true,
        city: true,
        isPremium: true,
        _count: {
          select: { habits: { where: { isArchived: false } } },
        },
      },
      orderBy: [{ level: "desc" }, { xp: "desc" }],
      take: 100,
    });

    // Rang global : compte uniquement les users avec niveau/xp supérieurs
    const [myUser, higherCount, total] = await Promise.all([
      db.user.findUnique({
        where: { id: session.user.id },
        select: { level: true, xp: true, showInLeaderboard: true },
      }),
      db.user.count({
        where: {
          showInLeaderboard: true,
          OR: [
            { level: { gt: 0 } }, // sera affiné ci-dessous
          ],
        },
      }),
      db.user.count({ where: { showInLeaderboard: true } }),
    ]);

    let myGlobalRank = 0;
    if (myUser?.showInLeaderboard) {
      const above = await db.user.count({
        where: {
          showInLeaderboard: true,
          OR: [
            { level: { gt: myUser.level } },
            { level: myUser.level, xp: { gt: myUser.xp } },
          ],
        },
      });
      myGlobalRank = above + 1;
    }

    return NextResponse.json({
      success: true,
      data: {
        users: users.map((u, i) => ({ ...u, rank: i + 1 })),
        myGlobalRank,
        total,
      },
    });
  } catch (error) {
    console.error("[LEADERBOARD_GET]", error);
    return NextResponse.json({ success: false, error: "Erreur interne" }, { status: 500 });
  }
}
