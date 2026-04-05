"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingModalProps {
  isOpen: boolean;
  needsProfile?: boolean;
}

const INTRO_STEPS = [
  {
    icon: "🎉",
    title: "Bienvenue sur Quotidia !",
    content:
      "Ton dashboard de vie personnel qui réunit habitudes, budget, objectifs et assistant IA. En quelques secondes, on te montre comment ça marche.",
  },
  {
    icon: "✅",
    title: "Tes habitudes",
    content:
      "Crée des habitudes quotidiennes ou hebdomadaires. Chaque jour, valide-les en un clic pour construire des streaks et gagner des XP. Plus tu es régulier, plus tu montes en niveau !",
  },
  {
    icon: "💰",
    title: "Ton budget",
    content:
      "Enregistre tes dépenses par catégorie et visualise où va ton argent. Un graphique hebdomadaire te montre tes tendances et t'aide à rester dans les clous.",
  },
  {
    icon: "🚀",
    title: "C'est parti !",
    content:
      "Tu es prêt à commencer. Crée ta première habitude et lance-toi ! Chaque petite habitude construite aujourd'hui crée le toi de demain.",
  },
];

const COUNTRIES = [
  { code: "FR", label: "France" },
  { code: "BE", label: "Belgique" },
  { code: "CH", label: "Suisse" },
  { code: "CA", label: "Canada" },
  { code: "LU", label: "Luxembourg" },
  { code: "MA", label: "Maroc" },
  { code: "SN", label: "Sénégal" },
  { code: "CI", label: "Côte d'Ivoire" },
  { code: "OTHER", label: "Autre" },
];

export function OnboardingModal({ isOpen, needsProfile = false }: OnboardingModalProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<"profile" | "intro">(needsProfile ? "profile" : "intro");
  const [introStep, setIntroStep] = useState(0);
  const [closing, setClosing] = useState(false);

  // Profil
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [showInLeaderboard, setShowInLeaderboard] = useState(true);
  const [saving, setSaving] = useState(false);

  if (!isOpen || closing) return null;

  const current = INTRO_STEPS[introStep];
  const isLast = introStep === INTRO_STEPS.length - 1;

  async function completeOnboarding(withProfile = false) {
    setClosing(true);
    try {
      const body = withProfile && country
        ? { country, city, showInLeaderboard }
        : {};
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
            Passer l&apos;intro
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
                <h2 className="text-xl font-bold text-textDark mb-1">Ton profil</h2>
                <p className="text-sm text-textLight">
                  Pour apparaître dans le classement et te comparer aux autres.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-textDark mb-1.5">
                    Pays
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-textDark focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Sélectionne ton pays</option>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-textDark mb-1.5">
                    Ville <span className="text-textLight font-normal">(optionnel)</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="ex: Paris"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-textDark placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer"
                  onClick={() => setShowInLeaderboard((v) => !v)}
                >
                  <div>
                    <p className="text-sm font-medium text-textDark">Apparaître dans le classement</p>
                    <p className="text-xs text-textLight">Ton nom et niveau visibles des autres</p>
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
                {saving ? "Enregistrement..." : "Continuer →"}
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

        {/* Progress dots — seulement en phase intro */}
        {phase === "intro" && (
          <div className="flex justify-center gap-2 my-5">
            {INTRO_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === introStep ? "w-6 bg-primary" : "w-2 bg-gray-200"
                }`}
              />
            ))}
          </div>
        )}

        {/* Boutons navigation intro */}
        {phase === "intro" && (
          <div className="flex gap-3">
            {introStep > 0 && (
              <button
                onClick={() => setIntroStep((s) => s - 1)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-textLight hover:bg-gray-50 transition"
              >
                Précédent
              </button>
            )}
            {isLast ? (
              <button
                onClick={handleFinish}
                className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition"
              >
                Créer ma première habitude →
              </button>
            ) : (
              <button
                onClick={() => setIntroStep((s) => s + 1)}
                className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition"
              >
                Suivant
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
