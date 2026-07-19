"use client";

import { useTheme } from "@/components/ThemeProvider";
import { useTranslations } from "next-intl";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const t = useTranslations("ui.themeToggle");

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? t("toLight") : t("toDark")}
      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition hover:bg-gray-100 dark:hover:bg-white/10 ${className}`}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
