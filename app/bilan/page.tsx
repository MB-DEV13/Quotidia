import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppShell } from "@/components/layout/AppShell";
import { BilanClient } from "@/components/bilan/BilanClient";
import Link from "next/link";

export default async function BilanPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { isPremium: true },
  });

  if (!user) redirect("/login");

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-textDark">Bilan hebdomadaire</h1>
          {!user.isPremium && (
            <Link
              href="/upgrade"
              className="text-xs bg-accent/10 text-accent font-medium px-3 py-1.5 rounded-full hover:bg-accent/20 transition"
            >
              ✨ Premium
            </Link>
          )}
        </div>

        {!user.isPremium ? (
          <div className="bg-white rounded-2xl shadow-soft p-8 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-lg font-semibold text-textDark mb-2">
              Bilan hebdomadaire
            </h2>
            <p className="text-sm text-textLight max-w-md mx-auto mb-6">
              Reçois chaque semaine un résumé de tes habitudes, dépenses, objectifs et l&apos;XP
              gagné. Identifie tes forces et tes axes d&apos;amélioration.
            </p>
            <Link
              href="/upgrade"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition"
            >
              ✨ Passer Premium — 4,99€/mois
            </Link>
          </div>
        ) : (
          <BilanClient />
        )}
      </div>
    </AppShell>
  );
}
