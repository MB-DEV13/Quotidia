"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { config } from "@/lib/config";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

interface UpgradePageClientProps {
  isPremium: boolean;
  stripeCurrentPeriodEnd: string | null;
}

export function UpgradePageClient({
  isPremium,
  stripeCurrentPeriodEnd,
}: UpgradePageClientProps) {
  const router = useRouter();
  const ph = usePostHog();
  const [loading, setLoading] = useState<"monthly" | "yearly" | "portal" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("upgrade.page");
  const locale = useLocale();
  const dateLocale = locale === "fr" ? "fr-FR" : "en-US";

  const FEATURES = t.raw("features") as Array<{ label: string; free: string; premium: string }>;
  const PERKS = t.raw("perks") as string[];

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
        setError(json.error ?? t("errorRedirect"));
        ph.capture("checkout_error", { plan: priceId, error: json.error });
        return;
      }
      if (json.data?.url) {
        window.location.href = json.data.url;
      }
    } catch {
      setError(t("errorNetwork"));
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
        setError(json.error ?? t("errorPortal"));
        return;
      }
      if (json.data?.url) {
        window.location.href = json.data.url;
      }
    } catch {
      setError(t("errorNetwork"));
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
          {t("backLink")}
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-soft text-sm text-accent font-medium mb-4">
            <span>✨</span> {t("badge")}
          </div>
          <h1 className="text-4xl font-bold text-textDark mb-3">
            {isPremium ? t("titlePremium") : t("titleFree")}
          </h1>
          <p className="text-textLight text-lg max-w-xl mx-auto">
            {isPremium
              ? t("subtitlePremium", { appName: config.app.name })
              : t("subtitleFree")}
          </p>
        </div>

        {/* Si déjà Premium */}
        {isPremium ? (
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-soft p-8 text-center">
            <div className="text-5xl mb-4">🏆</div>
            <h2 className="text-xl font-bold text-textDark mb-2">{t("alreadyPremiumTitle")}</h2>
            {stripeCurrentPeriodEnd && (
              <p className="text-sm text-textLight mb-6">
                {t("activeUntil", {
                  date: new Date(stripeCurrentPeriodEnd).toLocaleDateString(dateLocale, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }),
                })}
              </p>
            )}
            <button
              onClick={handlePortal}
              disabled={loading === "portal"}
              className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold transition disabled:opacity-60"
            >
              {loading === "portal" ? t("loading") : t("manageBtn")}
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
                  {t("bankFeatureTitle")}
                </h3>
                <p className="text-sm text-textLight leading-relaxed">
                  {t("bankFeatureDesc")}
                </p>
              </div>
              <span className="shrink-0 bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
                {t("bankFeatureBadge")}
              </span>
            </div>

            {/* Pricing cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {/* Mensuel */}
              <div className="bg-white rounded-2xl shadow-soft p-6 border-2 border-transparent hover:border-primary/20 transition">
                <div className="mb-4">
                  <p className="text-sm font-medium text-textLight uppercase tracking-wide mb-1">
                    {t("monthlyLabel")}
                  </p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-textDark">{t("monthlyPrice")}</span>
                    <span className="text-textLight mb-1">{t("monthlyPer")}</span>
                  </div>
                  <p className="text-xs text-textLight mt-1">{t("monthlyBilling")}</p>
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
                  {loading === "monthly" ? t("loading") : t("startBtn")}
                </button>
              </div>

              {/* Annuel — recommandé */}
              <div className="relative bg-gradient-to-br from-primary to-accent rounded-2xl shadow-card p-6 text-white">
                {/* Badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-warning text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                  {t("yearlyBadge")}
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-white/70 uppercase tracking-wide mb-1">
                    {t("yearlyLabel")}
                  </p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold">{t("yearlyPrice")}</span>
                    <span className="text-white/70 mb-1">{t("yearlyPer")}</span>
                  </div>
                  <p className="text-xs text-white/60 mt-1">
                    {t("yearlyPerMonth")}
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
                  {loading === "yearly" ? t("loading") : t("startBtn")}
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
                  {t("comparisonTitle")}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-6 py-3 font-medium text-textLight">
                        {t("colFeature")}
                      </th>
                      <th className="text-center px-4 py-3 font-medium text-textLight">
                        {t("colFree")}
                      </th>
                      <th className="text-center px-4 py-3 font-medium text-accent">
                        {t("colPremium")}
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
              {t("footer")}
            </p>
          </>
        )}
      </div>
    </main>
  );
}
