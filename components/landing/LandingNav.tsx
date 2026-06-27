"use client";

import Link from "next/link";
import { config } from "@/lib/config";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export function LandingNav() {
  const t = useTranslations("landing.nav");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2 cursor-pointer"
          aria-label={t("backToTop")}
        >
          <span className="text-2xl">🌀</span>
          <span className="font-bold text-lg text-[#5B5EA6]">{config.app.name}</span>
        </button>
        <nav className="hidden md:flex items-center gap-6 text-sm text-[#888888]">
          <a href="#features" className="hover:text-[#2D2D2D] transition">{t("features")}</a>
          <a href="#how" className="hover:text-[#2D2D2D] transition">{t("how")}</a>
          <a href="#pricing" className="hover:text-[#2D2D2D] transition">{t("pricing")}</a>
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link href="/login" className="text-sm font-medium text-[#888888] hover:text-[#2D2D2D] transition hidden sm:block">
            {t("login")}
          </Link>
          <Link href="/register" className="bg-[#5B5EA6] hover:bg-[#5B5EA6]/90 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-card">
            {t("cta")}
          </Link>
        </div>
      </div>
    </header>
  );
}
