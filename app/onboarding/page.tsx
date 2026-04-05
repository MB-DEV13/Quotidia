"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { AvatarPicker } from "@/components/ui/AvatarPicker";
import { Avatar } from "@/components/ui/Avatar";
import { LocationPicker } from "@/components/ui/LocationPicker";

const PERKS = [
  { icon: "🚀", text: "Inscription gratuite, sans carte bancaire" },
  { icon: "✅", text: "Habitudes & streaks dès le premier jour" },
  { icon: "🏆", text: "Classement mondial et badges" },
  { icon: "🤖", text: "Coach IA personnel inclus" },
  { icon: "🔒", text: "Tes données restent privées" },
];

const INTRO_STEPS = [
  { icon: "✅", title: "Tes habitudes", content: "Crée des habitudes quotidiennes ou hebdomadaires. Chaque jour validé construit ton streak et te rapporte des XP." },
  { icon: "💰", title: "Ton budget", content: "Enregistre tes dépenses par catégorie et visualise où va ton argent chaque mois." },
  { icon: "🚀", title: "C'est parti !", content: "Tu es prêt ! Crée ta première habitude et commence dès aujourd'hui." },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"profile" | "intro">("profile");
  const [introStep, setIntroStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [avatar, setAvatar] = useState("preset:1");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [showInLeaderboard, setShowInLeaderboard] = useState(true);

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, region, city, showInLeaderboard, avatar }),
      });
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
    setPhase("intro");
  }

  async function handleSkip() {
    await fetch("/api/user/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setPhase("intro");
  }

  async function handleFinish() {
    router.push("/habits");
  }

  const current = INTRO_STEPS[introStep];
  const isLast = introStep === INTRO_STEPS.length - 1;

  return (
    <main className="min-h-screen bg-background flex">

      {/* ── Colonne gauche (desktop) ─────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 bg-gradient-to-br from-primary to-accent p-10 text-white">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-3xl">🌀</span>
          <span className="font-bold text-xl">Quotidia</span>
        </Link>

        <div>
          <h2 className="text-3xl font-extrabold leading-tight mb-4">
            Commence<br />gratuitement.
          </h2>
          <p className="text-white/70 text-sm mb-8 leading-relaxed">
            Rejoins des milliers d&apos;utilisateurs qui ont transformé leurs habitudes et leur quotidien.
          </p>
          <ul className="space-y-3">
            {PERKS.map((p) => (
              <li key={p.text} className="flex items-center gap-3 text-sm">
                <span className="text-xl w-8 flex-shrink-0">{p.icon}</span>
                <span className="text-white/90">{p.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-white/40 text-xs">
          © {new Date().getFullYear()} Quotidia — Ton quotidien, en mieux.
        </p>
      </div>

      {/* ── Colonne droite ───────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <Link href="/" className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <span className="text-3xl">🌀</span>
            <span className="font-bold text-xl text-primary">Quotidia</span>
          </Link>

          <div className="bg-white rounded-2xl shadow-card p-8">

            {/* Indicateur de progression */}
            <div className="flex items-center gap-2 mb-7">
              {[{ num: 1, label: "Ton compte" }, { num: 2, label: "Ton profil" }].map((s, i) => (
                <div key={s.num} className="flex items-center gap-2 flex-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0 ${
                      s.num === 1 ? "bg-primary text-white" : phase === "profile" ? "bg-primary text-white" : "bg-primary text-white"
                    }`}>
                      {s.num === 1 ? "✓" : s.num}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${s.num <= 2 ? "text-primary" : "text-textLight"}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < 1 && (
                    <div className="flex-1 h-1 rounded-full bg-primary" />
                  )}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">

              {/* ── Phase profil ──────────────────────────────────────── */}
              {phase === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h1 className="text-2xl font-bold text-textDark mb-1">Ton profil</h1>
                  <p className="text-textLight text-sm mb-6">Personnalise ton compte — modifiable plus tard dans les paramètres.</p>

                  <form onSubmit={handleProfileSave} className="space-y-5">

                    {/* Avatar */}
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar avatar={avatar} name="" size="lg" />
                        <div>
                          <p className="text-sm font-semibold text-textDark">Choisis ton avatar</p>
                          <p className="text-xs text-textLight">Emojis ou ta propre photo</p>
                        </div>
                      </div>
                      <AvatarPicker value={avatar} onChange={setAvatar} />
                    </div>

                    {/* Localisation */}
                    <div>
                      <p className="text-sm font-semibold text-textDark mb-3">
                        Localisation <span className="text-textLight font-normal">(pour le classement)</span>
                      </p>
                      <LocationPicker
                        country={country} setCountry={setCountry}
                        region={region} setRegion={setRegion}
                        city={city} setCity={setCity}
                      />
                    </div>

                    {/* Leaderboard */}
                    <button
                      type="button"
                      onClick={() => setShowInLeaderboard((v) => !v)}
                      className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-xl p-4 transition"
                    >
                      <div className="text-left">
                        <p className="text-sm font-medium text-textDark">Apparaître dans le classement</p>
                        <p className="text-xs text-textLight mt-0.5">Comparaison avec les autres joueurs</p>
                      </div>
                      <div className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 flex-shrink-0 ml-4 ${showInLeaderboard ? "bg-primary" : "bg-gray-300"}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${showInLeaderboard ? "translate-x-5" : "translate-x-0"}`} />
                      </div>
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Enregistrement...
                        </>
                      ) : "C'est parti ! 🚀"}
                    </button>

                    <button
                      type="button"
                      onClick={handleSkip}
                      className="w-full text-center text-xs text-textLight hover:text-textDark transition"
                    >
                      Passer — je configurerai ça plus tard
                    </button>
                  </form>
                </motion.div>
              )}

              {/* ── Phase intro ───────────────────────────────────────── */}
              {phase === "intro" && (
                <motion.div
                  key={`intro-${introStep}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-center py-4">
                    <div className="text-5xl mb-4">{current.icon}</div>
                    <h2 className="text-xl font-bold text-textDark mb-3">{current.title}</h2>
                    <p className="text-sm text-textLight leading-relaxed">{current.content}</p>
                  </div>

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
                        className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-textLight hover:bg-gray-50 transition"
                      >
                        Précédent
                      </button>
                    )}
                    {isLast ? (
                      <button
                        onClick={handleFinish}
                        className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-xl transition"
                      >
                        Créer ma première habitude →
                      </button>
                    ) : (
                      <button
                        onClick={() => setIntroStep((s) => s + 1)}
                        className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-xl transition"
                      >
                        Suivant
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}
