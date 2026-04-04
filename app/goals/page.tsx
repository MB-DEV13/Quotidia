import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppShell } from "@/components/layout/AppShell";
import { GoalsClient } from "@/components/goals/GoalsClient";

const GOAL_FREE_LIMIT = 2;

export default async function GoalsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { isPremium: true },
  });

  if (!user) redirect("/login");

  const goals = await db.goal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const canAddMore = user.isPremium || goals.length < GOAL_FREE_LIMIT;

  const serializedGoals = goals.map((g) => ({
    id: g.id,
    title: g.title,
    icon: g.icon,
    color: g.color,
    target: g.target,
    current: g.current,
    unit: g.unit,
    deadline: g.deadline ? g.deadline.toISOString() : null,
    createdAt: g.createdAt.toISOString(),
  }));

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <GoalsClient
          initialGoals={serializedGoals}
          canAddMore={canAddMore}
          isPremium={user.isPremium}
        />
      </div>
    </AppShell>
  );
}
