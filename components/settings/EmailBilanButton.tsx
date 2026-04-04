"use client";

import { useState } from "react";
import Link from "next/link";

interface EmailBilanButtonProps {
  isPremium: boolean;
}

export function EmailBilanButton({ isPremium }: EmailBilanButtonProps) {
  const [loading, setLoading] = useState<"hebdo" | "mensuel" | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send(type: "hebdo" | "mensuel") {
    setLoading(type);
    setSuccess(null);
    setError(null);
    try {
      const res = await fetch(`/api/email/bilan-${type}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Erreur lors de l'envoi");
      } else {
        setSuccess(
          type === "hebdo"
            ? "Bilan hebdomadaire envoyé ! Vérifie ta boîte mail. 📬"
            : "Bilan mensuel envoyé ! Vérifie ta boîte mail. 📬"
        );
      }
    } catch {
      setError("Erreur réseau. Réessaie.");
    } finally {
      setLoading(null);
    }
  }

  if (!isPremium) {
    return (
      <div className="text-center py-3">
        <p className="text-sm text-textLight mb-3">
          🔒 Les bilans par email sont réservés aux membres Premium.
        </p>
        <Link
          href="/upgrade"
          className="inline-block px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold hover:opacity-90 transition"
        >
          ✨ Passer Premium
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <button
          onClick={() => send("hebdo")}
          disabled={loading !== null}
          className="flex-1 py-2.5 rounded-xl border border-primary text-primary text-sm font-semibold hover:bg-primary hover:text-white transition disabled:opacity-50"
        >
          {loading === "hebdo" ? "Envoi..." : "📊 Bilan hebdo"}
        </button>
        <button
          onClick={() => send("mensuel")}
          disabled={loading !== null}
          className="flex-1 py-2.5 rounded-xl border border-accent text-accent text-sm font-semibold hover:bg-accent hover:text-white transition disabled:opacity-50"
        >
          {loading === "mensuel" ? "Envoi..." : "🗓️ Bilan mensuel"}
        </button>
      </div>
      {success && <p className="text-xs text-success font-medium">{success}</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
      <p className="text-xs text-textLight">
        Le bilan hebdo couvre la semaine précédente. Le bilan mensuel couvre le mois précédent.
      </p>
    </div>
  );
}
