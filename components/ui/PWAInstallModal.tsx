"use client";

import { useEffect, useState } from "react";
import { config } from "@/lib/config";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

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
  const locale = useLocale();
  const t = useTranslations("ui.pwa");

  const isFr = locale === "fr";

  const INSTRUCTIONS: Record<Platform, { step: string; icon: string }[]> = {
    ios: [
      { icon: "📤", step: isFr ? "Appuie sur l'icône Partager en bas de Safari" : "Tap the Share icon at the bottom of Safari" },
      { icon: "➕", step: isFr ? 'Choisis "Sur l\'écran d\'accueil"' : 'Choose "Add to Home Screen"' },
      { icon: "✅", step: isFr ? 'Appuie sur "Ajouter" en haut à droite' : 'Tap "Add" in the top right' },
    ],
    android: [
      { icon: "⋮", step: isFr ? "Appuie sur le menu en haut à droite de Chrome" : "Tap the menu in the top right of Chrome" },
      { icon: "📲", step: isFr ? 'Choisis "Ajouter à l\'écran d\'accueil"' : 'Choose "Add to Home Screen"' },
      { icon: "✅", step: isFr ? "Confirme l'installation" : "Confirm the installation" },
    ],
    desktop: [
      { icon: "🖥️", step: isFr ? `Ouvre ${config.app.name} dans Google Chrome` : `Open ${config.app.name} in Google Chrome` },
      { icon: "💻", step: isFr ? "Clique sur l'icône écran avec une flèche ↓ dans la barre d'adresse" : "Click the install icon ↓ in the address bar" },
      { icon: "✅", step: isFr ? 'Clique sur "Installer" et profite !' : 'Click "Install" and enjoy!' },
    ],
    unknown: [
      { icon: "🌐", step: isFr ? `Ouvre ${config.app.name} dans Chrome ou Safari` : `Open ${config.app.name} in Chrome or Safari` },
      { icon: "📲", step: isFr ? 'Cherche l\'option "Ajouter à l\'écran d\'accueil"' : 'Find the "Add to Home Screen" option' },
      { icon: "✅", step: isFr ? "Confirme pour accéder en un tap !" : "Confirm for one-tap access!" },
    ],
  };

  const PLATFORM_LABEL: Record<Platform, string> = {
    ios: "iPhone / iPad",
    android: "Android",
    desktop: isFr ? "Ordinateur" : "Desktop",
    unknown: isFr ? "Ton appareil" : "Your device",
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
            aria-label={isFr ? "Fermer" : "Close"}
          >
            ×
          </button>
        </div>

        {/* Avantages */}
        <div className="bg-primary/5 rounded-2xl p-4 mb-5">
          <div className="grid grid-cols-3 gap-2 text-center text-xs text-textDark">
            <div>
              <div className="text-xl mb-1">⚡</div>
              <span className="font-medium">{isFr ? "Accès rapide" : "Quick access"}</span>
            </div>
            <div>
              <div className="text-xl mb-1">🔔</div>
              <span className="font-medium">{isFr ? "Notifications" : "Notifications"}</span>
            </div>
            <div>
              <div className="text-xl mb-1">📶</div>
              <span className="font-medium">{isFr ? "Hors-ligne" : "Offline"}</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <p className="text-xs font-semibold text-textLight uppercase tracking-wide mb-3">
          {isFr ? `Sur ${PLATFORM_LABEL[platform]}` : `On ${PLATFORM_LABEL[platform]}`}
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
            {isFr ? "Ne plus afficher ce message" : "Don't show this again"}
          </span>
        </label>

        {/* Bouton */}
        <button
          onClick={handleClose}
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl transition text-sm"
        >
          {isFr ? "J'ai compris, merci !" : "Got it, thanks!"}
        </button>
      </div>
    </div>
  );
}
