interface NextBadge {
  name: string;
  icon: string;
  description: string;
  progress: number;
  total: number;
}

export function NextBadgeCard({ badge }: { badge: NextBadge }) {
  const pct = Math.min(Math.round((badge.progress / badge.total) * 100), 99);

  return (
    <div className="bg-white rounded-2xl shadow-soft p-4 flex items-center gap-4">
      <div className="w-11 h-11 rounded-2xl bg-accent/10 flex items-center justify-center text-2xl flex-shrink-0">
        {badge.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-semibold text-textLight uppercase tracking-wide">Prochain badge</p>
          <span className="text-xs font-bold text-accent">{badge.progress}/{badge.total}</span>
        </div>
        <p className="text-sm font-bold text-textDark truncate">{badge.name}</p>
        <p className="text-xs text-textLight mb-2">{badge.description}</p>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
