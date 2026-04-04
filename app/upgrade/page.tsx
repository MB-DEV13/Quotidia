import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { UpgradePageClient } from "@/components/upgrade/UpgradePageClient";

export default async function UpgradePage() {
  const session = await getServerSession(authOptions);

  let isPremium = false;
  let stripeCurrentPeriodEnd: string | null = null;

  if (session?.user?.id) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { isPremium: true, stripeCurrentPeriodEnd: true },
    });
    isPremium = user?.isPremium ?? false;
    stripeCurrentPeriodEnd = user?.stripeCurrentPeriodEnd?.toISOString() ?? null;
  }

  return (
    <UpgradePageClient
      isPremium={isPremium}
      stripeCurrentPeriodEnd={stripeCurrentPeriodEnd}
    />
  );
}
