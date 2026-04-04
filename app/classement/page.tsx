import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppShell } from "@/components/layout/AppShell";
import { LeaderboardClient } from "@/components/leaderboard/LeaderboardClient";
import { getLevelTitle } from "@/lib/gamification";

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  // Top 100 global
  const users = await db.user.findMany({
    where: { showInLeaderboard: true },
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
      habits: { select: { bestStreak: true }, where: { isArchived: false } },
    },
    orderBy: [{ level: "desc" }, { xp: "desc" }],
    take: 100,
  });

  // Current user info (even if hidden from leaderboard)
  const me = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, avatar: true, level: true, xp: true, country: true, region: true, city: true, isPremium: true, showInLeaderboard: true, habits: { select: { bestStreak: true }, where: { isArchived: false } } },
  });

  if (!me) redirect("/login");

  // My global rank among visible users
  const allRanked = await db.user.findMany({
    where: { showInLeaderboard: true },
    select: { id: true },
    orderBy: [{ level: "desc" }, { xp: "desc" }],
  });
  const myGlobalRank = allRanked.findIndex((u) => u.id === session.user.id) + 1;

  // Available countries
  const countriesRaw = await db.user.findMany({
    where: { showInLeaderboard: true, country: { not: null } },
    select: { country: true },
    distinct: ["country"],
  });
  const availableCountries = countriesRaw.map((u) => u.country!).filter(Boolean);

  const serialized = users.map((u, i) => ({
    id: u.id,
    name: u.name,
    avatar: u.avatar,
    level: u.level,
    xp: u.xp,
    country: u.country,
    region: u.region,
    city: u.city,
    isPremium: u.isPremium,
    bestStreak: u.habits.length > 0 ? Math.max(...u.habits.map((h) => h.bestStreak)) : 0,
    rank: i + 1,
    levelTitle: getLevelTitle(u.level),
  }));

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-textDark">🏆 Classement</h1>
          <p className="text-textLight text-sm mt-1">Les meilleurs joueurs Quotidia</p>
        </div>

        <LeaderboardClient
          users={serialized}
          me={{ ...me, rank: myGlobalRank, levelTitle: getLevelTitle(me.level), bestStreak: me.habits.length > 0 ? Math.max(...me.habits.map((h) => h.bestStreak)) : 0 }}
          availableCountries={availableCountries}
          currentUserId={session.user.id}
        />
      </div>
    </AppShell>
  );
}
