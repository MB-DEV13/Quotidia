import { getTranslations } from "next-intl/server";

interface StreakCardProps {
  streak: number;
}

export async function StreakCard({ streak }: StreakCardProps) {
  const t = await getTranslations("dashboard.streak");

  return (
    <div className="bg-white rounded-2xl shadow-soft p-4">
      <p className="text-textLight text-xs mb-1">{t("title")}</p>
      <p className="text-2xl font-bold text-textDark">
        {streak > 0 ? `🔥 ${streak}` : "0"}{" "}
        <span className="text-sm font-normal text-textLight">
          {streak === 1 ? t("day") : t("days")}
        </span>
      </p>
    </div>
  );
}
