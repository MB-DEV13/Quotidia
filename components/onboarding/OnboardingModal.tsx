"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { config } from "@/lib/config";
import { useTranslations } from "next-intl";

interface IntroStep {
  icon: string;
  title: string;
  content: string;
}

interface OnboardingModalProps {
  isOpen: boolean;
  needsProfile?: boolean;
}

export function OnboardingModal({ isOpen, needsProfile = false }: OnboardingModalProps) {
  const t = useTranslations("onboarding.modal");
  const router = useRouter();
  const [phase, setPhase] = useState<"profile" | "intro">(needsProfile ? "profile" : "intro");
  const [introStep, setIntroStep] = useState(0);
  const [closing, setClosing] = useState(false);

  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [showInLeaderboard, setShowInLeaderboard] = useState(true);
  const [saving, setSaving] = useState(false);

  const rawSteps = t.raw("introSteps") as IntroStep[];
  const introSteps = rawSteps.map((step) => ({
    ...step,
    title: step.title.replace("{appName}", config.app.name),
  }));

  const countriesObj = t.raw("countries") as Record<string, string>;
  const countries = Object.entries(countriesObj).map(([code, label]) => ({ code, label }));

  if (!isOpen || closing) return null;

  const current = introSteps[introStep];
  const isLast = introStep === introSteps.length - 1;

  async function completeOnboarding(withProfile = false) {
    setClosing(true);
    try {
      const body = withProfile && country ? { country, city, showInLeaderboard } : {};
      await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch {
      // ignore
    }
  }

  async function handleProfileNext() {
    setSaving(true);
    try {
      await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, city, showInLeaderboard }),
      });
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
    setPhase("intro");
  }

  async function handleFinish() {
    await completeOnboarding();
    router.push("/habits");
  }

  async function handleSkip() {
    await completeOnboarding(phase === "profile");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        className="bg-white rounded-2xl shadow-card w-full max-w-md p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {/* Skip */}
        <div className="flex justify-end mb-2">
          <button
            onClick={handleSkip}
            className="text-xs text-textLight hover:text-textDark transition"
          >
            {t("skip")}
          </button>
        </div>

        <AnimatePresence mode="wait">

          {/* ── Phase profil ──────────────────────────────────── */}
          {phase === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center mb-5">
                <div className="text-4xl mb-3">🌍</div>
                <h2 className="text-xl font-bold text-textDark mb-1">{t("profileTitle")}</h2>
                <p className="text-sm text-textLight">{t("profileSubtitle")}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-textDark mb-1.5">
                    {t("countryLabel")}
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-textDark focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">{t("countryPlaceholder")}</option>
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-textDark mb-1.5">
                    {t("cityLabel")}{" "}
                    <span className="text-textLight font-normal">{t("optional")}</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={t("cityPlaceholder")}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-textDark placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer"
                  onClick={() => setShowInLeaderboard((v) => !v)}
                >
                  <div>
                    <p className="text-sm font-medium text-textDark">{t("leaderboardLabel")}</p>
                    <p className="text-xs text-textLight">{t("leaderboardHint")}</p>
                  </div>
                  <div className={`w-10 h-6 rounded-full transition-colors ${showInLeaderboard ? "bg-primary" : "bg-gray-200"} relative flex-shrink-0`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow absolute top-1 transition-all ${showInLeaderboard ? "left-5" : "left-1"}`} />
                  </div>
                </div>
              </div>

              <button
                onClick={handleProfileNext}
                disabled={saving}
                className="mt-5 w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition disabled:opacity-60"
              >
                {saving ? t("saving") : t("continue")}
              </button>
            </motion.div>
          )}

          {/* ── Phase intro ───────────────────────────────────── */}
          {phase === "intro" && (
            <motion.div
              key={`intro-${introStep}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              className="text-center py-4"
            >
              <div className="text-5xl mb-4">{current.icon}</div>
              <h2 className="text-xl font-bold text-textDark mb-3">{current.title}</h2>
              <p className="text-sm text-textLight leading-relaxed">{current.content}</p>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Progress dots */}
        {phase === "intro" && (
          <div className="flex justify-center gap-2 my-5">
            {introSteps.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === introStep ? "w-6 bg-primary" : "w-2 bg-gray-200"
                }`}
              />
            ))}
          </div>
        )}

        {/* Navigation intro */}
        {phase === "intro" && (
          <div className="flex gap-3">
            {introStep > 0 && (
              <button
                onClick={() => setIntroStep((s) => s - 1)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-textLight hover:bg-gray-50 transition"
              >
                {t("prev")}
              </button>
            )}
            {isLast ? (
              <button
                onClick={handleFinish}
                className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition"
              >
                {t("finish")}
              </button>
            ) : (
              <button
                onClick={() => setIntroStep((s) => s + 1)}
                className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition"
              >
                {t("next")}
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
