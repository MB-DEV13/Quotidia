"use client";

import { config } from "@/lib/config";

interface Props {
  onDismiss: () => void;
}

export function BankConnectionModal({ onDismiss }: Props) {
  function handleDismiss() {
    localStorage.setItem("quotidia_bridge_modal_dismissed", "true");
    onDismiss();
  }

  // ── Bientôt disponible (bankingEnabled = false) ──────────────────────────
  if (!config.features.bankingEnabled) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            aria-label="Fermer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-3xl mx-auto mb-4">
            🏗️
          </div>

          <h2 className="text-xl font-extrabold text-textDark text-center mb-2">
            Bientôt disponible
          </h2>
          <p className="text-sm text-textLight text-center mb-6 leading-relaxed">
            La connexion bancaire automatique est en cours de développement.<br />
            Cette fonctionnalité sera disponible très prochainement !
          </p>

          <ul className="space-y-2.5 mb-6">
            {[
              { icon: "⚡", text: "Import automatique de tes transactions" },
              { icon: "🏷️", text: "Catégorisation intelligente des dépenses" },
              { icon: "🔒", text: "Connexion sécurisée via Bridge by Bankin' (PSD2)" },
              { icon: "✏️", text: "Modification manuelle toujours possible" },
            ].map((item) => (
              <li key={item.text} className="flex items-start gap-3 text-sm text-textDark opacity-60">
                <span className="text-base shrink-0">{item.icon}</span>
                {item.text}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl px-3 py-2 mb-5">
            <span className="text-primary text-sm">💡</span>
            <p className="text-xs text-primary/80">
              En attendant, tu peux saisir tes dépenses manuellement depuis la page Budget.
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className="w-full bg-gradient-to-r from-primary to-accent text-white font-semibold py-3 rounded-xl transition hover:opacity-90"
          >
            OK, compris !
          </button>
        </div>
      </div>
    );
  }

  // ── Connexion bancaire réelle (bankingEnabled = true) ────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          aria-label="Fermer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-3xl mx-auto mb-4">
          🏦
        </div>

        <h2 className="text-xl font-extrabold text-textDark text-center mb-2">
          Connexion bancaire
        </h2>
        <p className="text-sm text-textLight text-center mb-6 leading-relaxed">
          Connecte ton compte bancaire pour importer automatiquement tes transactions.
        </p>

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

        <a
          href="/api/banking/connect"
          className="block w-full text-center bg-gradient-to-r from-primary to-accent text-white font-semibold py-3 rounded-xl transition hover:opacity-90 mb-3"
        >
          Connecter ma banque →
        </a>
        <button
          onClick={handleDismiss}
          className="w-full text-sm text-textLight hover:text-textDark transition py-2"
        >
          Plus tard
        </button>
      </div>
    </div>
  );
}
