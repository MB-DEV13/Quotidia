"use client";

import { config } from "@/lib/config";
import { useTranslations } from "next-intl";

interface Props {
  onDismiss: () => void;
}

export function BankConnectionModal({ onDismiss }: Props) {
  const t = useTranslations("budget.bank.modal");

  function handleDismiss() {
    localStorage.setItem("quotidia_bridge_modal_dismissed", "true");
    onDismiss();
  }

  if (!config.features.bankingEnabled) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            aria-label={t("closeLabel")}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-3xl mx-auto mb-4">
            🏗️
          </div>

          <h2 className="text-xl font-extrabold text-textDark text-center mb-2">
            {t("comingSoonTitle")}
          </h2>
          <p className="text-sm text-textLight text-center mb-6 leading-relaxed">
            {t("comingSoonDesc")}
          </p>

          <ul className="space-y-2.5 mb-6">
            {(t.raw("features") as string[]).map((text, i) => {
              const icons = ["⚡", "🏷️", "🔒", "✏️"];
              return (
                <li key={i} className="flex items-start gap-3 text-sm text-textDark opacity-60">
                  <span className="text-base shrink-0">{icons[i]}</span>
                  {text}
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl px-3 py-2 mb-5">
            <span className="text-primary text-sm">💡</span>
            <p className="text-xs text-primary/80">{t("hint")}</p>
          </div>

          <button
            onClick={handleDismiss}
            className="w-full bg-gradient-to-r from-primary to-accent text-white font-semibold py-3 rounded-xl transition hover:opacity-90"
          >
            {t("okBtn")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          aria-label={t("closeLabel")}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-3xl mx-auto mb-4">
          🏦
        </div>

        <h2 className="text-xl font-extrabold text-textDark text-center mb-2">
          {t("title")}
        </h2>
        <p className="text-sm text-textLight text-center mb-6 leading-relaxed">
          {t("subtitle")}
        </p>

        <ul className="space-y-2.5 mb-6">
          {(t.raw("features") as string[]).map((text, i) => {
            const icons = ["⚡", "🏷️", "🔒", "✏️"];
            return (
              <li key={i} className="flex items-start gap-3 text-sm text-textDark">
                <span className="text-base shrink-0">{icons[i]}</span>
                {text}
              </li>
            );
          })}
        </ul>

        <a
          href="/api/banking/connect"
          className="block w-full text-center bg-gradient-to-r from-primary to-accent text-white font-semibold py-3 rounded-xl transition hover:opacity-90 mb-3"
        >
          {t("connectBtn")}
        </a>
        <button
          onClick={handleDismiss}
          className="w-full text-sm text-textLight hover:text-textDark transition py-2"
        >
          {t("laterBtn")}
        </button>
      </div>
    </div>
  );
}
