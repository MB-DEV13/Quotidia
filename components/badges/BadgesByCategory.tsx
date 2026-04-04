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

interface BadgesByCategoryProps {
  badges: BadgeItem[];
}

const CATEGORIES = [
  {
    label: "🏃 Habitudes",
    conditions: ["first_habit", "streak_7", "streak_21", "streak_30", "perfect_week", "completions_365", "habits_5_active"],
  },
  {
    label: "🎯 Objectifs",
    conditions: ["first_goal_created", "first_goal", "goals_3", "goals_5", "goals_10"],
  },
  {
    label: "💰 Finances",
    conditions: ["budget_1m", "budget_3m", "budget_6m", "budget_8m", "budget_10m", "budget_12m"],
  },
  {
    label: "📅 Connexion",
    conditions: ["login_1w", "login_4w", "login_12w", "login_52w"],
  },
];

function BadgeCard({ badge }: { badge: BadgeItem }) {
  return (
    <div className={`rounded-2xl p-4 flex flex-col items-center text-center transition ${badge.earned ? "bg-primary/5 border border-primary/10" : "bg-gray-50 opacity-50"}`}>
      <span className={`text-3xl mb-2 ${!badge.earned ? "grayscale" : ""}`}>{badge.icon}</span>
      <p className="text-xs font-semibold text-textDark mb-0.5 leading-tight">{badge.name}</p>
      <p className="text-[10px] text-textLight mb-2 leading-tight">{badge.description}</p>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.earned ? "bg-success/10 text-success" : "bg-gray-100 text-textLight"}`}>
        +{badge.xpReward} XP
      </span>
      {badge.earned && badge.earnedAt && (
        <p className="text-[10px] text-textLight mt-1">{formatDate(badge.earnedAt)}</p>
      )}
    </div>
  );
}

export function BadgesByCategory({ badges }: BadgesByCategoryProps) {
  const byCondition = new Map(badges.map((b) => [b.condition, b]));

  return (
    <div className="space-y-6">
      {CATEGORIES.map((cat) => {
        const catBadges = cat.conditions.map((c) => byCondition.get(c)).filter(Boolean) as BadgeItem[];
        const earnedCount = catBadges.filter((b) => b.earned).length;
        return (
          <div key={cat.label}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-textDark">{cat.label}</p>
              <span className="text-xs text-textLight">{earnedCount}/{catBadges.length}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {catBadges.map((badge) => (
                <BadgeCard key={badge.condition} badge={badge} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
