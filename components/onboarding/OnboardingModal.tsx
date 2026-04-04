"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingModalProps {
  isOpen: boolean;
}

const STEPS = [
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

export function OnboardingModal({ isOpen }: OnboardingModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [closing, setClosing] = useState(false);

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  async function completeOnboarding() {
    setClosing(true);
    try {
      await fetch("/api/user/onboarding", { method: "POST" });
    } catch {
      // ignore
    }
  }

  async function handleFinish() {
    await completeOnboarding();
    router.push("/habits");
    router.refresh();
  }

  async function handleSkip() {
    await completeOnboarding();
    router.refresh();
  }

  if (!isOpen || closing) return null;

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

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
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
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 my-5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step ? "w-6 bg-primary" : "w-2 bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
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
              onClick={() => setStep((s) => s + 1)}
              className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition"
            >
              Suivant
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
