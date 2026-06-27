"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";

interface SettingsSubscriptionProps {
  isPremium: boolean;
  aiRemaining: number | null;
  stripeCurrentPeriodEnd: string | null;
  budgetMode: string;
  bankConnection: {
    status: string;
    bankName: string | null;
    lastSyncAt: string | null;
  } | null;
}

export function SettingsSubscription({
  isPremium,
  aiRemaining,
  stripeCurrentPeriodEnd,
  budgetMode,
  bankConnection,
}: SettingsSubscriptionProps) {
  const t = useTranslations("settings.subscription");
  const locale = useLocale();
  const router = useRouter();
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentBudgetMode, setCurrentBudgetMode] = useState(budgetMode);
  const [togglingMode, setTogglingMode] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const dateLocale = locale === "fr" ? "fr-FR" : "en-US";

  async function handleToggleMode(newMode: "manual" | "automatic") {
    if (newMode === currentBudgetMode || togglingMode) return;
    setTogglingMode(true);
    try {
      const res = await fetch("/api/bridge/mode", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budgetMode: newMode }),
      });
      if (res.ok) {
        setCurrentBudgetMode(newMode);
        router.refresh();
      }
    } finally {
      setTogglingMode(false);
    }
  }

  async function handleDisconnect() {
    if (disconnecting) return;
    setDisconnecting(true);
    try {
      const res = await fetch("/api/bridge/disconnect", { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setDisconnecting(false);
    }
  }

  async function handlePortal() {
    setLoadingPortal(true);
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
      setLoadingPortal(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft p-6">
      <h2 className="text-sm font-semibold text-textLight uppercase tracking-wide mb-4">
        {t("title")}
      </h2>

      {isPremium ? (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 bg-accent/15 text-accent text-sm font-semibold px-3 py-1 rounded-full">
              ✨ {t("premium")}
            </span>
          </div>
          <p className="text-sm text-textLight mb-1">
            {t("unlimitedAccess")}
          </p>
          {stripeCurrentPeriodEnd && (
            <p className="text-xs text-textLight mb-4">
              {t("renewsAt", {
                date: new Date(stripeCurrentPeriodEnd).toLocaleDateString(dateLocale, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }),
              })}
            </p>
          )}
          {/* Section connexion bancaire */}
          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-xs font-semibold text-textLight uppercase tracking-wide mb-3">{t("bankConnection")}</p>

            {/* Toggle mode */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => handleToggleMode("manual")}
                disabled={togglingMode}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
                  currentBudgetMode === "manual"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-textLight hover:bg-gray-200"
                }`}
              >
                {t("modeManual")}
              </button>
              <button
                onClick={() => handleToggleMode("automatic")}
                disabled={togglingMode || !bankConnection || bankConnection.status !== "active"}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
                  currentBudgetMode === "automatic"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-textLight hover:bg-gray-200 disabled:opacity-40"
                }`}
              >
                {t("modeAutomatic")}
              </button>
            </div>

            {bankConnection?.status === "active" ? (
              <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-2.5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-textDark">
                    {bankConnection.bankName ?? t("bankConnected")}
                    <span className="ml-2 text-xs font-medium px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full">{t("bankActive")}</span>
                  </p>
                  {bankConnection.lastSyncAt && (
                    <p className="text-xs text-textLight mt-0.5">
                      {t("bankSync", {
                        date: new Date(bankConnection.lastSyncAt).toLocaleDateString(dateLocale, {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                        }),
                      })}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="text-xs text-danger hover:text-danger/80 font-medium transition disabled:opacity-50 shrink-0"
                >
                  {disconnecting ? t("bankDisconnecting") : t("bankDisconnect")}
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 flex items-center justify-between gap-3">
                <p className="text-sm text-textLight">{t("noBankConnected")}</p>
                <Link
                  href="/budget"
                  className="text-xs text-primary font-semibold hover:text-primary/80 transition shrink-0"
                >
                  {t("connectBank")}
                </Link>
              </div>
            )}
          </div>

          <div className="mt-4">
            <button
              onClick={handlePortal}
              disabled={loadingPortal}
              className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-textLight hover:bg-gray-50 disabled:opacity-60 transition"
            >
              {loadingPortal ? t("manageBtnLoading") : t("manageBtn")}
            </button>
          </div>
          {error && <p className="text-xs text-danger mt-2">{error}</p>}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-textLight text-sm font-medium px-3 py-1 rounded-full">
              {t("free")}
            </span>
          </div>
          <ul className="text-xs text-textLight space-y-1 mb-4">
            <li>• {t("freeHabits")}</li>
            <li>• {t("freeGoals")}</li>
            {aiRemaining !== null && (
              <li className="text-ai">
                • 💬 {aiRemaining > 1
                  ? t("aiRemainingPlural", { count: aiRemaining })
                  : t("aiRemaining", { count: aiRemaining })}
              </li>
            )}
          </ul>
          <Link
            href="/upgrade"
            className="block w-full text-center py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-sm hover:opacity-90 transition"
          >
            {t("upgradePremiumCta")}
          </Link>
        </div>
      )}
    </div>
  );
}
