"use client";

import { useState } from "react";

interface Props {
  bankName: string | null;
  lastSyncAt: Date | null;
  status: string;
}

export function BankConnectionStatus({ bankName, lastSyncAt, status }: Props) {
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const [error, setError] = useState("");

  async function handleSync() {
    setSyncing(true);
    setError("");
    setSynced(false);
    try {
      const res = await fetch("/api/bridge/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSynced(true);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de sync");
    } finally {
      setSyncing(false);
    }
  }

  const lastSync = lastSyncAt
    ? new Date(lastSyncAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className={`mb-6 rounded-2xl px-4 py-3.5 flex items-center gap-3 border ${
      status === "active"
        ? "bg-green-50 border-green-100"
        : status === "error"
        ? "bg-red-50 border-red-100"
        : "bg-gray-50 border-gray-100"
    }`}>
      <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl shrink-0">
        🏦
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-textDark">
          {bankName ?? "Banque connectée"}
          <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${
            status === "active" ? "bg-green-100 text-green-700" :
            status === "error" ? "bg-red-100 text-red-700" :
            "bg-gray-100 text-gray-600"
          }`}>
            {status === "active" ? "✓ Actif" : status === "error" ? "⚠ Erreur" : "Inactif"}
          </span>
        </p>
        {lastSync && (
          <p className="text-xs text-textLight mt-0.5">Dernière sync : {lastSync}</p>
        )}
        {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
        {synced && <p className="text-xs text-green-600 mt-0.5">✓ Synchronisé !</p>}
      </div>
      <button
        onClick={handleSync}
        disabled={syncing || status !== "active"}
        className="shrink-0 text-xs font-semibold text-primary hover:text-primary/80 transition disabled:opacity-40 flex items-center gap-1"
      >
        {syncing ? (
          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : "↻"} Synchroniser
      </button>
    </div>
  );
}
