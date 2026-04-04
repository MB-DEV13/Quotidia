"use client";

import { useState } from "react";

interface Props {
  onDismiss: () => void;
}

export function BankConnectionModal({ onDismiss }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConnect() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/bridge/connect", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
      setLoading(false);
    }
  }

  function handleDismiss() {
    localStorage.setItem("quotidia_bridge_modal_dismissed", "true");
    onDismiss();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Fermer */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          aria-label="Fermer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Icône */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-3xl mx-auto mb-4">
          🏦
        </div>

        <h2 className="text-xl font-extrabold text-textDark text-center mb-2">
          Connecte ta banque
        </h2>
        <p className="text-sm text-textLight text-center mb-6 leading-relaxed">
          En tant que membre <span className="font-semibold text-primary">Premium</span>, tu peux synchroniser automatiquement tes dépenses et revenus directement depuis ton compte bancaire. Plus besoin de saisie manuelle !
        </p>

        {/* Avantages */}
        <ul className="space-y-2.5 mb-6">
          {[
            { icon: "⚡", text: "Import automatique de tes transactions" },
            { icon: "🏷️", text: "Catégorisation intelligente des dépenses" },
            { icon: "🔒", text: "Connexion sécurisée via Bridge by Bankin' (PSD2)" },
            { icon: "✏️", text: "Modification manuelle toujours possible" },
          ].map((item) => (
            <li key={item.text} className="flex items-start gap-3 text-sm text-textDark">
              <span className="text-base shrink-0">{item.icon}</span>
              {item.text}
            </li>
          ))}
        </ul>

        {/* Badge sécurité */}
        <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2 mb-5">
          <span className="text-green-600 text-sm">🔐</span>
          <p className="text-xs text-green-700">
            Tes identifiants bancaires ne sont jamais stockés. Connexion certifiée PSD2.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center mb-3">{error}</p>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={handleConnect}
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-accent text-white font-semibold py-3 rounded-xl transition hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Connexion en cours...
              </>
            ) : (
              "🏦 Connecter ma banque"
            )}
          </button>
          <button
            onClick={handleDismiss}
            className="w-full text-sm text-textLight hover:text-textDark transition py-2"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}
