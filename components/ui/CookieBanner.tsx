"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { config } from "@/lib/config";
import { useTranslations } from "next-intl";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const t = useTranslations("ui.cookie");

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem("cookie_consent", "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-card border border-gray-100 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-textDark mb-1">🍪 {config.app.name}</p>
          <p className="text-xs text-textLight leading-relaxed">
            {t("message")}{" "}
            <Link href="/legal/confidentialite" className="text-primary underline hover:no-underline">
              En savoir plus
            </Link>
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={decline}
            className="text-xs font-medium text-textLight hover:text-textDark px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 transition"
          >
            {t("decline")}
          </button>
          <button
            onClick={accept}
            className="text-xs font-semibold text-white bg-primary hover:bg-primary/90 px-4 py-2 rounded-xl transition"
          >
            {t("accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
