"use client";

import { formatDate } from "@/lib/utils";

interface BadgeItem {
  name: string;
  description: string;
  icon: string;
  condition: string;
  xpReward: number;
  earned: boolean;
  earnedAt: string | null;
}

interface BadgesGridProps {
  badges: BadgeItem[];
}

export function BadgesGrid({ badges }: BadgesGridProps) {
  const earned = badges.filter((b) => b.earned);
  const notEarned = badges.filter((b) => !b.earned);

  return (
    <div className="space-y-6">
      {earned.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-textLight uppercase tracking-wide mb-3">
            Badges obtenus ({earned.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {earned.map((badge) => (
              <div
                key={badge.condition}
                className="bg-white rounded-2xl shadow-soft p-4 flex flex-col items-center text-center"
              >
                <span className="text-3xl mb-2">{badge.icon}</span>
                <p className="text-sm font-semibold text-textDark mb-0.5">{badge.name}</p>
                <p className="text-xs text-textLight mb-2">{badge.description}</p>
                <span className="text-xs bg-success/10 text-success font-semibold px-2.5 py-1 rounded-full">
                  +{badge.xpReward} XP
                </span>
                {badge.earnedAt && (
                  <p className="text-xs text-textLight mt-1.5">
                    {formatDate(badge.earnedAt)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {notEarned.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-textLight uppercase tracking-wide mb-3">
            À débloquer ({notEarned.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {notEarned.map((badge) => (
              <div
                key={badge.condition}
                className="bg-white rounded-2xl shadow-soft p-4 flex flex-col items-center text-center opacity-50"
              >
                <span className="text-3xl mb-2 grayscale">{badge.icon}</span>
                <p className="text-sm font-semibold text-textDark mb-0.5">{badge.name}</p>
                <p className="text-xs text-textLight mb-2">{badge.description}</p>
                <span className="text-xs bg-gray-100 text-textLight font-semibold px-2.5 py-1 rounded-full">
                  +{badge.xpReward} XP
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {badges.length === 0 && (
        <div className="bg-white rounded-2xl shadow-soft p-8 text-center">
          <p className="text-3xl mb-2">🏅</p>
          <p className="text-textLight text-sm">
            Commence à utiliser Quotidia pour débloquer des badges !
          </p>
        </div>
      )}
    </div>
  );
}
