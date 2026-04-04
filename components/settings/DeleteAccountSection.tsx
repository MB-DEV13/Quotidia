"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export function DeleteAccountSection() {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (confirmation !== "SUPPRIMER") return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Erreur inconnue");
        setLoading(false);
        return;
      }
      await signOut({ callbackUrl: "/" });
    } catch {
      setError("Erreur réseau");
      setLoading(false);
    }
  }

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full py-3 rounded-xl border border-danger/30 text-danger text-sm font-medium hover:bg-danger/5 transition"
        >
          Supprimer mon compte
        </button>
      ) : (
        <div className="space-y-3">
          <div className="bg-danger/5 border border-danger/20 rounded-xl p-4">
            <p className="text-sm font-semibold text-danger mb-1">⚠️ Action irréversible</p>
            <p className="text-xs text-textLight">
              Toutes tes données seront définitivement supprimées : habitudes, dépenses, objectifs, badges et historique. Cette action ne peut pas être annulée.
            </p>
          </div>
          <p className="text-xs text-textLight">
            Tape <span className="font-bold text-textDark">SUPPRIMER</span> pour confirmer :
          </p>
          <input
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="SUPPRIMER"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-danger/30"
          />
          {error && <p className="text-xs text-danger">{error}</p>}
          <div className="flex gap-3">
            <button
              onClick={() => { setOpen(false); setConfirmation(""); setError(null); }}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-textLight hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              onClick={handleDelete}
              disabled={confirmation !== "SUPPRIMER" || loading}
              className="flex-1 py-3 rounded-xl bg-danger text-white text-sm font-semibold disabled:opacity-40 hover:bg-danger/90 transition"
            >
              {loading ? "Suppression..." : "Supprimer définitivement"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
