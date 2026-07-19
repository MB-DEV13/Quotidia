"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

interface LanguageSwitcherProps {
  showLabel?: boolean;
}

export function LanguageSwitcher({ showLabel = false }: LanguageSwitcherProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("ui.languageSwitcher");

  const setLocale = (newLocale: string) => {
    if (newLocale === locale) return;
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  };

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Language selector">
      <button
        onClick={() => setLocale("fr")}
        className={`flex items-center gap-1 text-sm px-1.5 py-0.5 rounded-lg transition-all ${
          locale === "fr"
            ? "opacity-100 ring-2 ring-[#5B5EA6] bg-[#5B5EA6]/10"
            : "opacity-40 hover:opacity-70"
        }`}
        title={t("fr")}
        aria-label={t("switchToFr")}
        aria-pressed={locale === "fr"}
      >
        <span className="text-base leading-none">🇫🇷</span>
        {showLabel && <span className="font-medium text-xs">FR</span>}
      </button>
      <button
        onClick={() => setLocale("en")}
        className={`flex items-center gap-1 text-sm px-1.5 py-0.5 rounded-lg transition-all ${
          locale === "en"
            ? "opacity-100 ring-2 ring-[#5B5EA6] bg-[#5B5EA6]/10"
            : "opacity-40 hover:opacity-70"
        }`}
        title={t("en")}
        aria-label={t("switchToEn")}
        aria-pressed={locale === "en"}
      >
        <span className="text-base leading-none">🇬🇧</span>
        {showLabel && <span className="font-medium text-xs">EN</span>}
      </button>
    </div>
  );
}
