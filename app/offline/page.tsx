"use client";

import { config } from "@/lib/config";
import { useTranslations } from "next-intl";

export default function OfflinePage() {
  const t = useTranslations("offline");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-soft p-10 text-center max-w-sm w-full">
        <p className="text-5xl mb-4">📡</p>
        <h1 className="text-xl font-bold text-textDark mb-2">{t("title")}</h1>
        <p className="text-sm text-textLight mb-6">
          {t("description", { appName: config.app.name })}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition text-sm"
        >
          {t("retry")}
        </button>
      </div>
    </div>
  );
}
