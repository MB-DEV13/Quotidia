interface StreakCardProps {
  streak: number;
}

export function StreakCard({ streak }: StreakCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-soft p-4">
      <p className="text-textLight text-xs mb-1">Meilleur streak actuel</p>
      <p className="text-2xl font-bold text-textDark">
        {streak > 0 ? `🔥 ${streak}` : "0"}{" "}
        <span className="text-sm font-normal text-textLight">
          {streak === 1 ? "jour" : "jours"}
        </span>
      </p>
    </div>
  );
}
