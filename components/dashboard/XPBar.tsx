import Link from "next/link";

interface Badge {
  name: string;
  icon: string;
  description: string;
}

interface XPBarProps {
  current: number;
  needed: number;
  percentage: number;
  level: number;
  earnedBadges: Badge[];
}

export function XPBar({ current, needed, percentage, level, earnedBadges }: XPBarProps) {
  const displayedBadges = earnedBadges.slice(0, 7);
  const remaining = earnedBadges.length - displayedBadges.length;

  return (
    <div className="bg-white rounded-2xl shadow-soft p-4">
      {/* XP progress */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-textDark">Niveau {level}</span>
        <span className="text-xs text-textLight">{current} / {needed} XP</span>
      </div>
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-textLight mt-1">{percentage}% vers le niveau {level + 1}</p>

      {/* Badges débloqués */}
      {earnedBadges.length > 0 ? (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-textLight uppercase tracking-wide">
              {earnedBadges.length} badge{earnedBadges.length > 1 ? "s" : ""} débloqué{earnedBadges.length > 1 ? "s" : ""}
            </span>
            <Link
              href="/settings"
              className="text-xs text-primary hover:underline underline-offset-2 font-medium"
            >
              Voir tout →
            </Link>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {displayedBadges.map((badge) => (
              <div
                key={badge.name}
                title={`${badge.name} — ${badge.description}`}
                className="relative group"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-accent/15 border border-primary/10 flex items-center justify-center text-lg transition-transform hover:scale-110 cursor-default select-none">
                  {badge.icon}
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-textDark text-white text-[10px] rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                  {badge.name}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-textDark" />
                </div>
              </div>
            ))}
            {remaining > 0 && (
              <div className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                <span className="text-xs font-bold text-textLight">+{remaining}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
          <span className="text-base">🔒</span>
          <p className="text-xs text-textLight">Complète tes habitudes pour débloquer des badges</p>
        </div>
      )}
    </div>
  );
}
