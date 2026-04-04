import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppShell } from "@/components/layout/AppShell";
import { StatsClient } from "@/components/stats/StatsClient";
import Link from "next/link";

export default async function StatsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { isPremium: true },
  });

  if (!user) redirect("/login");

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-textDark">Statistiques avancées</h1>
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
            <div className="text-5xl mb-4">📊</div>
            <h2 className="text-lg font-semibold text-textDark mb-2">
              Statistiques avancées
            </h2>
            <p className="text-sm text-textLight max-w-md mx-auto mb-6">
              Accède à tes stats sur 30 et 90 jours, visualise l&apos;évolution de tes habitudes
              et de tes dépenses. Disponible avec Premium.
            </p>
            <Link
              href="/upgrade"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition"
            >
              ✨ Passer Premium — 4,99€/mois
            </Link>
          </div>
        ) : (
          <StatsClient />
        )}
      </div>
    </AppShell>
  );
}
