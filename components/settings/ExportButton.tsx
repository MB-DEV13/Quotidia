"use client";

import { useState } from "react";

interface ExportButtonProps {
  isPremium: boolean;
}

export function ExportButton({ isPremium }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    if (!isPremium) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/export");
      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Erreur lors de l'export");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const disposition = res.headers.get("Content-Disposition") ?? "";
      const filenameMatch = disposition.match(/filename="([^"]+)"/);
      a.download = filenameMatch?.[1] ?? "quotidia-export.csv";

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError("Erreur lors du téléchargement");
    } finally {
      setLoading(false);
    }
  }

  if (!isPremium) {
    return (
      <div className="group relative inline-block w-full">
        <button
          disabled
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-200 text-sm font-medium text-textLight opacity-60 cursor-not-allowed bg-gray-50"
        >
          <span>📥</span>
          Exporter mes données (CSV)
          <span className="ml-auto text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
            Premium
          </span>
        </button>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-textDark text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
          Fonctionnalité Premium
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleExport}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-primary/20 text-sm font-medium text-primary hover:bg-primary/5 disabled:opacity-60 transition"
      >
        <span>📥</span>
        {loading ? "Export en cours..." : "Exporter mes données (CSV)"}
      </button>
      {error && (
        <p className="text-xs text-danger mt-1.5 text-center">{error}</p>
      )}
    </div>
  );
}
