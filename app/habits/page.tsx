import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getLast7Days } from "@/lib/utils";
import { AppShell } from "@/components/layout/AppShell";
import { HabitsClient } from "@/components/habits/HabitsClient";
import { FREE_LIMITS } from "@/lib/config";

export default async function HabitsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const t = await getTranslations("habits");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { isPremium: true },
  });

  const last7Days = getLast7Days();
  const weekStart = last7Days[0];

  const habits = await db.habit.findMany({
    where: { userId: session.user.id },
    include: { completions: { where: { date: { gte: weekStart } } } },
    orderBy: { createdAt: "asc" },
  });

  const activeCount = habits.filter((h) => !h.isArchived).length;
  const canAddMore = user?.isPremium || activeCount < FREE_LIMITS.HABITS;
  const remaining = FREE_LIMITS.HABITS - activeCount;

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-textDark">{t("pageTitle")}</h1>
            <p className="text-textLight text-sm mt-1">
              {activeCount === 1 ? t("activeCount", { count: activeCount }) : t("activeCountPlural", { count: activeCount })}
              {!user?.isPremium && ` · ${remaining === 1 ? t("remainingFree", { count: remaining }) : t("remainingFreePlural", { count: remaining })}`}
            </p>
          </div>
          {!user?.isPremium && (
            <div className="text-xs text-textLight bg-white rounded-xl px-3 py-1.5 shadow-soft">
              {t("usedFree", { used: activeCount, max: FREE_LIMITS.HABITS })}
            </div>
          )}
        </div>
        <HabitsClient initialHabits={habits} canAddMore={canAddMore} isPremium={user?.isPremium ?? false} />
      </div>
    </AppShell>
  );
}
