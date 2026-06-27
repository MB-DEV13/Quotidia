"use client";

import { useTranslations } from "next-intl";

interface DashboardHeaderProps {
  name: string | null;
  serverHour: number;
  isPremium: boolean;
  dateLabel: string;
}

function getGreetingKey(hour: number): "morning" | "afternoon" | "evening" {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

function getGreetingEmoji(hour: number): string {
  if (hour >= 5 && hour < 12) return "👋";
  if (hour < 18) return "☀️";
  return "🌙";
}

export function DashboardHeader({ name, serverHour, isPremium, dateLabel }: DashboardHeaderProps) {
  const t = useTranslations("dashboard");
  const greetingKey = getGreetingKey(serverHour);
  const greeting = t(`greeting.${greetingKey}`);
  const emoji = getGreetingEmoji(serverHour);

  return (
    <div className="mb-6">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-textDark">
            {greeting}{name ? `, ${name}` : ""} {emoji}
          </h1>
          <p className="text-textLight text-sm mt-0.5 capitalize">{dateLabel}</p>
        </div>
        {!isPremium && (
          <a href="/upgrade" className="hidden sm:flex items-center gap-1.5 bg-accent/10 hover:bg-accent/20 text-accent text-xs font-semibold px-3 py-1.5 rounded-full transition">
            {t("upgradePremium")}
          </a>
        )}
      </div>
    </div>
  );
}
