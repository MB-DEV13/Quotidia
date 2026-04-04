"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AvatarPicker } from "@/components/ui/AvatarPicker";
import { Avatar } from "@/components/ui/Avatar";
import { LocationPicker } from "@/components/ui/LocationPicker";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

const STEPS = [
  { num: 1, label: "Ton compte" },
  { num: 2, label: "Ton profil" },
];

const PERKS = [
  { icon: "🚀", text: "Inscription gratuite, sans carte bancaire" },
  { icon: "✅", text: "Habitudes & streaks dès le premier jour" },
  { icon: "🏆", text: "Classement mondial et badges" },
  { icon: "🤖", text: "Coach IA personnel inclus" },
  { icon: "🔒", text: "Tes données restent privées" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptCgu, setAcceptCgu] = useState(false);

  // Step 2
  const [avatar, setAvatar] = useState("preset:1");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [showInLeaderboard, setShowInLeaderboard] = useState(true);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordStrength =
    password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3;
  const strengthLabel = ["", "Trop court", "Correct", "Fort"];
  const strengthColor = ["", "bg-danger", "bg-warning", "bg-success"];
  const strengthText = ["", "text-danger", "text-warning", "text-success"];

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (!acceptCgu) {
      setError("Tu dois accepter les CGU pour continuer.");
      return;
    }
    setStep(2);
  }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, avatar, country, region, city, showInLeaderboard }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Une erreur est survenue.");
      setLoading(false);
      setStep(1);
      return;
    }

    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("Compte créé, mais connexion échouée. Essaie de te connecter manuellement.");
      setLoading(false);
      return;
    }
    router.push("/dashboard");
  }

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

      {/* ── Colonne droite / formulaire ──────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <Link href="/" className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <span className="text-3xl">🌀</span>
            <span className="font-bold text-xl text-primary">Quotidia</span>
          </Link>

          <div className="bg-white rounded-2xl shadow-card p-8">

            {/* Indicateur de progression avec labels */}
            <div className="flex items-center gap-2 mb-7">
              {STEPS.map((s, i) => (
                <div key={s.num} className="flex items-center gap-2 flex-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0 ${
                      step > s.num ? "bg-primary text-white" : step === s.num ? "bg-primary text-white" : "bg-gray-100 text-textLight"
                    }`}>
                      {step > s.num ? "✓" : s.num}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${step >= s.num ? "text-primary" : "text-textLight"}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-1 rounded-full transition-all ${step > s.num ? "bg-primary" : "bg-gray-100"}`} />
                  )}
                </div>
              ))}
            </div>

            {/* ── ÉTAPE 1 ── */}
            {step === 1 ? (
              <>
                <h1 className="text-2xl font-bold text-textDark mb-1">Créer un compte</h1>
                <p className="text-textLight text-sm mb-6">Commence à suivre ton quotidien dès maintenant.</p>

                {/* Google */}
                <button
                  onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                  className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-medium text-textDark hover:bg-gray-50 transition mb-4"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continuer avec Google
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-textLight">ou</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <form onSubmit={handleStep1} className="space-y-4">
                  {error && <p className="text-sm text-danger bg-red-50 p-3 rounded-xl">{error}</p>}

                  {/* Prénom */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-textDark mb-1">Prénom</label>
                    <input
                      id="name" type="text" value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                      placeholder="Alex"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-textDark mb-1">Email</label>
                    <input
                      id="email" type="email" value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required autoComplete="email"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                      placeholder="toi@example.com"
                    />
                  </div>

                  {/* Mot de passe */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-textDark mb-1">Mot de passe</label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required minLength={8} autoComplete="new-password"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                        placeholder="8 caractères minimum"
                      />
                      <button type="button" onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-textLight hover:text-textDark transition"
                        aria-label={showPassword ? "Masquer" : "Afficher"}>
                        <EyeIcon open={showPassword} />
                      </button>
                    </div>
                    {/* Jauge de force */}
                    {password.length > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex gap-1 flex-1">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= passwordStrength ? strengthColor[passwordStrength] : "bg-gray-100"}`} />
                          ))}
                        </div>
                        <span className={`text-xs font-medium ${strengthText[passwordStrength]}`}>
                          {strengthLabel[passwordStrength]}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirmer le mot de passe */}
                  <div>
                    <label htmlFor="confirm" className="block text-sm font-medium text-textDark mb-1">Confirmer le mot de passe</label>
                    <div className="relative">
                      <input
                        id="confirm"
                        type={showConfirm ? "text" : "password"}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        required autoComplete="new-password"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                        placeholder="Répète ton mot de passe"
                      />
                      <button type="button" onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-textLight hover:text-textDark transition"
                        aria-label={showConfirm ? "Masquer" : "Afficher"}>
                        <EyeIcon open={showConfirm} />
                      </button>
                    </div>
                    {confirm.length > 0 && password !== confirm && (
                      <p className="text-xs text-danger mt-1">Les mots de passe ne correspondent pas.</p>
                    )}
                    {confirm.length > 0 && password === confirm && password.length >= 8 && (
                      <p className="text-xs text-success mt-1">✓ Les mots de passe correspondent.</p>
                    )}
                  </div>

                  {/* CGU */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={acceptCgu}
                        onChange={(e) => setAcceptCgu(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${acceptCgu ? "bg-primary border-primary" : "border-gray-300 group-hover:border-primary/50"}`}>
                        {acceptCgu && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-textLight leading-relaxed">
                      J&apos;accepte les{" "}
                      <Link href="/legal/cgu" target="_blank" className="text-primary hover:underline font-medium">CGU</Link>
                      {" "}et la{" "}
                      <Link href="/legal/confidentialite" target="_blank" className="text-primary hover:underline font-medium">politique de confidentialité</Link>
                      {" "}de Quotidia.
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl transition"
                  >
                    Continuer → Ton profil
                  </button>
                </form>

                <p className="text-center text-sm text-textLight mt-6">
                  Déjà un compte ?{" "}
                  <Link href="/login" className="text-primary font-medium hover:underline">Se connecter</Link>
                </p>
              </>

            ) : (
              /* ── ÉTAPE 2 ── */
              <>
                <h1 className="text-2xl font-bold text-textDark mb-1">Ton profil</h1>
                <p className="text-textLight text-sm mb-6">Personnalise ton compte — modifiable plus tard dans les paramètres.</p>

                <form onSubmit={handleStep2} className="space-y-5">
                  {error && <p className="text-sm text-danger bg-red-50 p-3 rounded-xl">{error}</p>}

                  {/* Avatar */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar avatar={avatar} name={name} size="lg" />
                      <div>
                        <p className="text-sm font-semibold text-textDark">Choisis ton avatar</p>
                        <p className="text-xs text-textLight">6 presets ou lien image</p>
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

                  {/* Leaderboard opt-in */}
                  <button
                    type="button" onClick={() => setShowInLeaderboard((v) => !v)}
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

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button" onClick={() => setStep(1)}
                      className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-textLight hover:bg-gray-50 transition"
                    >
                      ← Retour
                    </button>
                    <button
                      type="submit" disabled={loading}
                      className="flex-1 py-3 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Création...
                        </>
                      ) : (
                        "C'est parti ! 🚀"
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStep2({ preventDefault: () => {} } as React.FormEvent)}
                    className="w-full text-center text-xs text-textLight hover:text-textDark transition"
                  >
                    Passer — je configurerai ça plus tard
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
