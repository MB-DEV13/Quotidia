"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import Link from "next/link";

interface UpgradePageClientProps {
  isPremium: boolean;
  stripeCurrentPeriodEnd: string | null;
}

const FEATURES = [
  { label: "Habitudes", free: "3 max", premium: "Illimitées" },
  { label: "Objectifs", free: "2 max", premium: "Illimités" },
  { label: "Budget", free: "1 catégorie", premium: "Illimité" },
  { label: "🏦 Connexion bancaire", free: "—", premium: "Sync auto" },
  { label: "Historique", free: "30 jours", premium: "Illimité" },
  { label: "Assistant IA", free: "5 req./mois", premium: "Illimité" },
  { label: "Gamification", free: "Streaks uniquement", premium: "Badges + Niveaux + XP" },
  { label: "Stats avancées", free: "7 jours", premium: "30 / 90 jours" },
  { label: "Bilan périodique", free: "—", premium: "Hebdo + Mensuel" },
  { label: "Thèmes", free: "Clair uniquement", premium: "Clair + Sombre" },
  { label: "Export données", free: "—", premium: "CSV" },
];

const PERKS = [
  "Habitudes & objectifs illimités",
  "🏦 Connexion bancaire automatique",
  "Assistant IA sans limite",
  "Badges exclusifs & niveaux avancés",
  "Stats sur 30 et 90 jours",
  "Bilan hebdomadaire personnalisé",
  "Export CSV de toutes tes données",
  "Thème sombre",
  "Support prioritaire",
];

export function UpgradePageClient({
  isPremium,
  stripeCurrentPeriodEnd,
}: UpgradePageClientProps) {
  const router = useRouter();
  const ph = usePostHog();
  const [loading, setLoading] = useState<"monthly" | "yearly" | "portal" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(priceId: "monthly" | "yearly") {
    setLoading(priceId);
    setError(null);
    ph.capture("checkout_started", { plan: priceId });
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Erreur lors de la redirection");
        ph.capture("checkout_error", { plan: priceId, error: json.error });
        return;
      }
      if (json.data?.url) {
        window.location.href = json.data.url;
      }
    } catch {
      setError("Erreur réseau. Réessaie.");
    } finally {
      setLoading(null);
    }
  }

  async function handlePortal() {
    setLoading("portal");
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Erreur portail");
        return;
      }
      if (json.data?.url) {
        window.location.href = json.data.url;
      }
    } catch {
      setError("Erreur réseau. Réessaie.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-textLight hover:text-textDark transition mb-8"
        >
          ← Retour au dashboard
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-soft text-sm text-accent font-medium mb-4">
            <span>✨</span> Passe au niveau supérieur
          </div>
          <h1 className="text-4xl font-bold text-textDark mb-3">
            {isPremium ? "Ton abonnement Premium" : "Passez à Premium"}
          </h1>
          <p className="text-textLight text-lg max-w-xl mx-auto">
            {isPremium
              ? "Merci de soutenir Quotidia ! Tu profites de toutes les fonctionnalités sans limite."
              : "Débloque toutes les fonctionnalités et transforme vraiment ton quotidien."}
          </p>
        </div>

        {/* Si déjà Premium */}
        {isPremium ? (
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-soft p-8 text-center">
            <div className="text-5xl mb-4">🏆</div>
            <h2 className="text-xl font-bold text-textDark mb-2">Tu es Premium !</h2>
            {stripeCurrentPeriodEnd && (
              <p className="text-sm text-textLight mb-6">
                Abonnement actif jusqu&apos;au{" "}
                <span className="font-semibold text-textDark">
                  {new Date(stripeCurrentPeriodEnd).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </p>
            )}
            <button
              onClick={handlePortal}
              disabled={loading === "portal"}
              className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold transition disabled:opacity-60"
            >
              {loading === "portal" ? "Chargement..." : "Gérer mon abonnement"}
            </button>
            {error && <p className="text-xs text-danger mt-3">{error}</p>}
          </div>
        ) : (
          <>
            {/* Highlight bancaire */}
            <div className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-100 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-3xl shrink-0">
                🏦
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-base font-bold text-textDark mb-1">
                  Nouvelle fonctionnalité — Connexion bancaire automatique
                </h3>
                <p className="text-sm text-textLight leading-relaxed">
                  Connecte ton compte bancaire en 1 clic (via Open Banking PSD2). Tes transactions arrivent automatiquement dans ton budget, catégorisées intelligemment. Fini la saisie manuelle.
                </p>
              </div>
              <span className="shrink-0 bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
                Premium exclusif
              </span>
            </div>

            {/* Pricing cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {/* Mensuel */}
              <div className="bg-white rounded-2xl shadow-soft p-6 border-2 border-transparent hover:border-primary/20 transition">
                <div className="mb-4">
                  <p className="text-sm font-medium text-textLight uppercase tracking-wide mb-1">
                    Mensuel
                  </p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-textDark">4,99€</span>
                    <span className="text-textLight mb-1">/mois</span>
                  </div>
                  <p className="text-xs text-textLight mt-1">Facturé mensuellement</p>
                </div>

                <ul className="space-y-2 mb-6">
                  {PERKS.map((perk) => (
                    <li key={perk} className="flex items-center gap-2 text-sm text-textDark">
                      <span className="text-success font-bold flex-shrink-0">✓</span>
                      {perk}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCheckout("monthly")}
                  disabled={loading !== null}
                  className="w-full py-3 rounded-xl border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-white transition disabled:opacity-60"
                >
                  {loading === "monthly" ? "Chargement..." : "Commencer maintenant"}
                </button>
              </div>

              {/* Annuel — recommandé */}
              <div className="relative bg-gradient-to-br from-primary to-accent rounded-2xl shadow-card p-6 text-white">
                {/* Badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-warning text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                  ⭐ 2 mois offerts
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-white/70 uppercase tracking-wide mb-1">
                    Annuel
                  </p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold">39,99€</span>
                    <span className="text-white/70 mb-1">/an</span>
                  </div>
                  <p className="text-xs text-white/60 mt-1">
                    Soit 3,33€/mois · Économise 20%
                  </p>
                </div>

                <ul className="space-y-2 mb-6">
                  {PERKS.map((perk) => (
                    <li key={perk} className="flex items-center gap-2 text-sm text-white">
                      <span className="font-bold flex-shrink-0">✓</span>
                      {perk}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCheckout("yearly")}
                  disabled={loading !== null}
                  className="w-full py-3 rounded-xl bg-white text-primary font-semibold hover:bg-white/90 transition disabled:opacity-60"
                >
                  {loading === "yearly" ? "Chargement..." : "Commencer maintenant"}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-center text-sm text-danger mb-6">{error}</p>
            )}

            {/* Comparison table */}
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-textDark">
                  Comparaison Gratuit vs Premium
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-6 py-3 font-medium text-textLight">
                        Fonctionnalité
                      </th>
                      <th className="text-center px-4 py-3 font-medium text-textLight">
                        Gratuit
                      </th>
                      <th className="text-center px-4 py-3 font-medium text-accent">
                        Premium ✨
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {FEATURES.map((f, i) => (
                      <tr
                        key={f.label}
                        className={i % 2 === 0 ? "bg-gray-50/50" : ""}
                      >
                        <td className="px-6 py-3 font-medium text-textDark">{f.label}</td>
                        <td className="px-4 py-3 text-center text-textLight">{f.free}</td>
                        <td className="px-4 py-3 text-center text-success font-medium">
                          {f.premium}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer note */}
            <p className="text-center text-xs text-textLight mt-6">
              Paiement sécurisé via Stripe · Annulation à tout moment · Sans engagement
            </p>
          </>
        )}
      </div>
    </main>
  );
}
