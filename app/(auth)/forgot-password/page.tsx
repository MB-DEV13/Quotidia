"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Une erreur est survenue. Réessaie dans quelques instants.");
      return;
    }

    setSent(true);
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <span className="text-3xl">🌀</span>
          <span className="font-bold text-xl text-primary">Quotidia</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-card p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">📬</div>
              <h1 className="text-xl font-bold text-textDark mb-2">Email envoyé !</h1>
              <p className="text-sm text-textLight mb-6 leading-relaxed">
                Si un compte existe pour <strong className="text-textDark">{email}</strong>, tu recevras un lien de réinitialisation dans quelques minutes. Pense à vérifier tes spams.
              </p>
              <p className="text-xs text-textLight mb-6">Le lien est valable <strong>1 heure</strong>.</p>
              <Link href="/login" className="inline-block w-full text-center bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl transition text-sm">
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-textDark mb-1">Mot de passe oublié ?</h1>
                <p className="text-sm text-textLight">
                  Saisis ton email et on t&apos;envoie un lien de réinitialisation.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <p className="text-sm text-danger bg-red-50 p-3 rounded-xl">{error}</p>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-textDark mb-1">
                    Adresse email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                    placeholder="toi@example.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    "Envoyer le lien"
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-textLight mt-6">
                <Link href="/login" className="text-primary font-medium hover:underline">
                  ← Retour à la connexion
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
