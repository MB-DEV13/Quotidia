"use client";

import { useState } from "react";

interface DailyReminderToggleProps {
  enabled: boolean;
  isPremium: boolean;
}

export function DailyReminderToggle({ enabled: initialEnabled, isPremium }: DailyReminderToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    if (!isPremium) return;
    const next = !enabled;
    setEnabled(next);
    setLoading(true);
    try {
      await fetch("/api/user/reminder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dailyReminderEnabled: next }),
      });
    } catch {
      setEnabled(!next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading || !isPremium}
      className={`w-full flex items-center justify-between rounded-xl p-4 transition ${
        isPremium ? "hover:bg-gray-100 bg-gray-50" : "bg-gray-50 opacity-60 cursor-not-allowed"
      }`}
    >
      <div className="text-left">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-textDark">Rappel quotidien</p>
          {!isPremium && (
            <span className="text-[10px] bg-accent/10 text-accent font-semibold px-1.5 py-0.5 rounded-full">
              Premium
            </span>
          )}
        </div>
        <p className="text-xs text-textLight mt-0.5">
          {isPremium
            ? "Reçois un email de rappel chaque soir si tes habitudes ne sont pas validées"
            : "Disponible avec le plan Premium"}
        </p>
      </div>
      <div
        className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 shrink-0 ml-3 ${
          enabled && isPremium ? "bg-primary" : "bg-gray-300"
        }`}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
            enabled && isPremium ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
    </button>
  );
}
