"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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

const AVATARS = [
  "preset:1", "preset:2", "preset:3", "preset:4",
  "preset:5", "preset:6", "preset:7", "preset:8",
];

const AVATAR_EMOJIS: Record<string, string> = {
  "preset:1": "😊", "preset:2": "🦁", "preset:3": "🐼",
  "preset:4": "🦊", "preset:5": "🐨", "preset:6": "🦋",
  "preset:7": "🌟", "preset:8": "🔥",
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<"profile" | "intro">("profile");
  const [introStep, setIntroStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [avatar, setAvatar] = useState("preset:1");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [showInLeaderboard, setShowInLeaderboard] = useState(true);

  const INTRO_STEPS = [
    { icon: "✅", title: "Tes habitudes", content: "Crée des habitudes quotidiennes ou hebdomadaires. Chaque jour validé construit ton streak et te rapporte des XP." },
    { icon: "💰", title: "Ton budget", content: "Enregistre tes dépenses par catégorie et visualise où va ton argent chaque mois." },
    { icon: "🚀", title: "C'est parti !", content: "Tu es prêt ! Crée ta première habitude et commence dès aujourd'hui." },
  ];

  async function handleProfileSave() {
    setSaving(true);
    try {
      await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, city, showInLeaderboard, avatar }),
      });
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
    setStep("intro");
  }

  async function handleFinish() {
    await fetch("/api/user/onboarding", { method: "POST" });
    router.push("/habits");
  }

  const current = INTRO_STEPS[introStep];
  const isLast = introStep === INTRO_STEPS.length - 1;

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <motion.div
        className="bg-white rounded-2xl shadow-card w-full max-w-md p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <span className="text-3xl">🌀</span>
          <p className="text-sm font-semibold text-primary mt-1">Quotidia</p>
        </div>

        {step === "profile" && (
          <>
            <h1 className="text-xl font-bold text-textDark text-center mb-1">
              Personnalise ton profil
            </h1>
            <p className="text-sm text-textLight text-center mb-6">
              Quelques infos pour rejoindre le classement et personaliser ton expérience.
            </p>

            {/* Avatar */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-textDark mb-2">
                Choisis ton avatar
              </label>
              <div className="grid grid-cols-4 gap-2">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAvatar(a)}
                    className={`w-full aspect-square rounded-xl text-2xl flex items-center justify-center border-2 transition-all ${
                      avatar === a
                        ? "border-primary bg-primary/10"
                        : "border-gray-100 bg-gray-50 hover:border-primary/30"
                    }`}
                  >
                    {AVATAR_EMOJIS[a]}
                  </button>
                ))}
              </div>
            </div>

            {/* Pays */}
            <div className="mb-4">
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

            {/* Ville */}
            <div className="mb-4">
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

            {/* Classement */}
            <div
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer mb-6"
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

            <button
              onClick={handleProfileSave}
              disabled={saving}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-sm transition hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Enregistrement..." : "Continuer →"}
            </button>
          </>
        )}

        {step === "intro" && (
          <>
            <motion.div
              key={introStep}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="text-center py-4"
            >
              <div className="text-5xl mb-4">{current.icon}</div>
              <h2 className="text-xl font-bold text-textDark mb-3">{current.title}</h2>
              <p className="text-sm text-textLight leading-relaxed">{current.content}</p>
            </motion.div>

            <div className="flex justify-center gap-2 my-5">
              {INTRO_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${i === introStep ? "w-6 bg-primary" : "w-2 bg-gray-200"}`}
                />
              ))}
            </div>

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
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold transition hover:opacity-90"
                >
                  Créer ma première habitude →
                </button>
              ) : (
                <button
                  onClick={() => setIntroStep((s) => s + 1)}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold transition hover:opacity-90"
                >
                  Suivant
                </button>
              )}
            </div>
          </>
        )}
      </motion.div>
    </main>
  );
}
