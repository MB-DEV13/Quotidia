import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getLast7Days } from "@/lib/utils";
import { AppShell } from "@/components/layout/AppShell";
import { HabitsClient } from "@/components/habits/HabitsClient";
import { FREE_LIMITS } from "@/lib/config";

export default async function HabitsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

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

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-textDark">Mes habitudes</h1>
            <p className="text-textLight text-sm mt-1">
              {activeCount} habitude(s) active(s)
              {!user?.isPremium && ` · ${FREE_LIMITS.HABITS - activeCount} restante(s) en gratuit`}
            </p>
          </div>
          {!user?.isPremium && (
            <div className="text-xs text-textLight bg-white rounded-xl px-3 py-1.5 shadow-soft">
              {activeCount}/{FREE_LIMITS.HABITS} gratuites
            </div>
          )}
        </div>
        <HabitsClient initialHabits={habits} canAddMore={canAddMore} isPremium={user?.isPremium ?? false} />
      </div>
    </AppShell>
  );
}
