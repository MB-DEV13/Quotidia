import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppShell } from "@/components/layout/AppShell";
import { BADGES } from "@/lib/gamification";
import { SettingsTabs } from "@/components/settings/SettingsTabs";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const [user, bankConnection] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        avatar: true,
        level: true,
        xp: true,
        isPremium: true,
        createdAt: true,
        aiRequestsUsed: true,
        stripeCurrentPeriodEnd: true,
        country: true,
        region: true,
        city: true,
        showInLeaderboard: true,
        loginStreak: true,
        password: true,
        dailyReminderEnabled: true,
        budgetMode: true,
      },
    }),
    db.bankConnection.findUnique({
      where: { userId: session.user.id },
      select: { status: true, bankName: true, lastSyncAt: true },
    }),
  ]);

  if (!user) redirect("/login");

  const userBadges = await db.userBadge.findMany({
    where: { userId: session.user.id },
    include: { badge: true },
    orderBy: { earnedAt: "desc" },
  });

  const earnedConditions = new Set(userBadges.map((ub) => ub.badge.condition));

  const allBadges = BADGES.map((badge) => ({
    ...badge,
    earned: earnedConditions.has(badge.condition),
    earnedAt: userBadges.find((ub) => ub.badge.condition === badge.condition)?.earnedAt?.toISOString() ?? null,
  }));

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-textDark mb-6">Paramètres</h1>
        <SettingsTabs
          user={{
            ...user,
            createdAt: user.createdAt.toISOString(),
            stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd?.toISOString() ?? null,
            hasPassword: !!user.password,
            dailyReminderEnabled: user.dailyReminderEnabled,
            budgetMode: user.budgetMode ?? "manual",
          }}
          badges={allBadges}
          bankConnection={bankConnection ? {
            status: bankConnection.status,
            bankName: bankConnection.bankName,
            lastSyncAt: bankConnection.lastSyncAt?.toISOString() ?? null,
          } : null}
        />
      </div>
    </AppShell>
  );
}
