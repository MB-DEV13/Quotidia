"use client";

import { useState } from "react";

export function PasswordChangeForm() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (next !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (next.length < 8) {
      setError("Le nouveau mot de passe doit faire au moins 8 caractères.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Erreur inconnue");
        return;
      }
      setSuccess(true);
      setCurrent(""); setNext(""); setConfirm("");
      setOpen(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-textDark">Mot de passe</p>
          <p className="text-xs text-textLight mt-0.5">Modifie ton mot de passe de connexion</p>
        </div>
        <button
          onClick={() => { setOpen((v) => !v); setError(null); }}
          className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-textLight hover:bg-gray-50 transition"
        >
          {open ? "Annuler" : "Modifier"}
        </button>
      </div>

      {success && (
        <p className="text-sm text-success bg-green-50 px-4 py-2 rounded-xl mt-3">
          ✅ Mot de passe mis à jour
        </p>
      )}

      {open && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 pt-4 border-t border-gray-100">
          <input
            type="password"
            placeholder="Mot de passe actuel"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            type="password"
            placeholder="Nouveau mot de passe (min. 8 caractères)"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            type="password"
            placeholder="Confirmer le nouveau mot de passe"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {error && <p className="text-xs text-danger">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-semibold rounded-xl transition text-sm"
          >
            {loading ? "Enregistrement..." : "Changer le mot de passe"}
          </button>
        </form>
      )}
    </div>
  );
}
