"use client";

import { useEffect, useState } from "react";
import { config } from "@/lib/config";
import { useTranslations } from "next-intl";

const STORAGE_KEY = "quotidia_pwa_modal_dismissed";

type Platform = "ios" | "android" | "desktop" | "unknown";

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua) && !/Chrome/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  if (/Chrome/.test(ua) && !/Mobile/.test(ua)) return "desktop";
  return "unknown";
}

export function PWAInstallModal() {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [dontShow, setDontShow] = useState(false);
  const t = useTranslations("ui.pwa");

  const INSTRUCTIONS: Record<Platform, { step: string; icon: string }[]> = {
    ios: [
      { icon: "📤", step: t("iosStep1") },
      { icon: "➕", step: t("iosStep2") },
      { icon: "✅", step: t("iosStep3") },
    ],
    android: [
      { icon: "⋮", step: t("androidStep1") },
      { icon: "📲", step: t("androidStep2") },
      { icon: "✅", step: t("androidStep3") },
    ],
    desktop: [
      { icon: "🖥️", step: t("desktopStep1", { appName: config.app.name }) },
      { icon: "💻", step: t("desktopStep2") },
      { icon: "✅", step: t("desktopStep3") },
    ],
    unknown: [
      { icon: "🌐", step: t("unknownStep1", { appName: config.app.name }) },
      { icon: "📲", step: t("unknownStep2") },
      { icon: "✅", step: t("unknownStep3") },
    ],
  };

  const PLATFORM_LABEL: Record<Platform, string> = {
    ios: "iPhone / iPad",
    android: "Android",
    desktop: t("desktop"),
    unknown: t("yourDevice"),
  };

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "true") return;
    const timer = setTimeout(() => {
      setPlatform(detectPlatform());
      setVisible(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  function handleClose() {
    if (dontShow) localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  }

  if (!visible) return null;

  const steps = INSTRUCTIONS[platform];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">📱</span>
            </div>
            <div>
              <h2 className="font-extrabold text-textDark text-lg leading-tight">
                {t("title")}
              </h2>
              <p className="text-xs text-textLight">{t("subtitle")}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-textLight hover:text-textDark transition text-xl leading-none mt-0.5"
            aria-label={t("closeLabel")}
          >
            ×
          </button>
        </div>

        {/* Avantages */}
        <div className="bg-primary/5 rounded-2xl p-4 mb-5">
          <div className="grid grid-cols-3 gap-2 text-center text-xs text-textDark">
            <div>
              <div className="text-xl mb-1">⚡</div>
              <span className="font-medium">{t("quickAccess")}</span>
            </div>
            <div>
              <div className="text-xl mb-1">🔔</div>
              <span className="font-medium">{t("notifications")}</span>
            </div>
            <div>
              <div className="text-xl mb-1">📶</div>
              <span className="font-medium">{t("offline")}</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <p className="text-xs font-semibold text-textLight uppercase tracking-wide mb-3">
          {t("platformPrefix", { platform: PLATFORM_LABEL[platform] })}
        </p>
        <ol className="space-y-3 mb-5">
          {steps.map((s, i) => (
            <li key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-base">
                {s.icon}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm text-textDark">{s.step}</span>
              </div>
            </li>
          ))}
        </ol>

        {/* Ne plus afficher */}
        <label className="flex items-center gap-2.5 mb-4 cursor-pointer group">
          <input
            type="checkbox"
            checked={dontShow}
            onChange={(e) => setDontShow(e.target.checked)}
            className="w-4 h-4 accent-primary rounded cursor-pointer"
          />
          <span className="text-xs text-textLight group-hover:text-textDark transition">
            {t("dontShow")}
          </span>
        </label>

        {/* Bouton */}
        <button
          onClick={handleClose}
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl transition text-sm"
        >
          {t("gotIt")}
        </button>
      </div>
    </div>
  );
}
