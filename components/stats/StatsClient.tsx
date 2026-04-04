"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

type Period = 7 | 30 | 90;

interface DayData {
  date: string;
  completed: number;
  total: number;
  rate: number;
  dayOfWeek: number;
}

interface StatsData {
  days: DayData[];
  expensesChart: { month: string; total: number }[];
  expensesByCategory: { category: string; amount: number }[];
  bestHabit: { name: string; streak: number; icon: string | null } | null;
  topHabits: { name: string; icon: string | null; color: string; rate: number; completions: number }[];
  avgCompletionRate: number;
  trend: number;
  avgFirst: number;
  avgSecond: number;
  bestDayOfWeek: { label: string; rate: number } | null;
  totalIncome: number;
  goalsStats: {
    active: number;
    completed: number;
    total: number;
    globalPct: number;
    bestGoal: { title: string; icon: string; color: string; pct: number } | null;
  };
  summary: {
    totalCompleted: number;
    totalExpenses: number;
    habitsCount: number;
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  Alimentation: "#FF9800", Restaurant: "#F97316", Transport: "#5B5EA6",
  Carburant: "#6366F1", Logement: "#0EA5E9", Charges: "#38BDF8",
  Santé: "#4CAF50", Pharmacie: "#22C55E", Sport: "#84CC16",
  Loisirs: "#9B72CF", Voyages: "#EC4899", Vêtements: "#F472B6",
  Culture: "#8B5CF6", "High-tech": "#3B82F6", Abonnements: "#EF4444",
  Beauté: "#FB7185", Épargne: "#14B8A6", Autres: "#888888",
};

// --- Skeleton ---
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className ?? ""}`} />;
}

function StatsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
      </div>
      <Skeleton className="h-40" />
      <Skeleton className="h-56" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
      </div>
    </div>
  );
}

// --- Contribution calendar ---
function ContributionGrid({ days }: { days: DayData[] }) {
  function getColor(rate: number) {
    if (rate === 0) return "bg-gray-100";
    if (rate < 50) return "bg-success/25";
    if (rate < 80) return "bg-success/55";
    if (rate < 100) return "bg-success/80";
    return "bg-success";
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft p-4">
      <h3 className="text-sm font-semibold text-textDark mb-3">Calendrier de complétion</h3>
      <div className="flex flex-wrap gap-1">
        {days.map((d, i) => (
          <div key={i} className="relative group">
            <div
              className={`w-5 h-5 rounded-sm ${getColor(d.rate)} cursor-default transition-transform hover:scale-125`}
              title={`${d.date} — ${d.rate}%`}
            />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10 transition-opacity">
              {d.date} · {d.rate}%
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-[10px] text-textLight">Moins</span>
        {["bg-gray-100", "bg-success/25", "bg-success/55", "bg-success/80", "bg-success"].map((c, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
        ))}
        <span className="text-[10px] text-textLight">Plus</span>
      </div>
    </div>
  );
}

// --- Pie chart tooltip ---
function PieTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-card border border-gray-100 px-3 py-2 text-xs">
      <p className="font-semibold text-textDark">{payload[0].name}</p>
      <p className="text-textLight">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export function StatsClient() {
  const [period, setPeriod] = useState<Period>(7);
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (p: Period) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/stats?period=${p}`);
      const json = await res.json();
      if (!res.ok || !json.success) { setError(json.error ?? "Erreur chargement"); return; }
      setData(json.data as StatsData);
    } catch { setError("Erreur réseau"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStats(period); }, [period, fetchStats]);

  const periods: { value: Period; label: string }[] = [
    { value: 7, label: "7 jours" },
    { value: 30, label: "30 jours" },
    { value: 90, label: "90 jours" },
  ];

  return (
    <div className="space-y-6">
      {/* Sélecteur période */}
      <div className="flex gap-2 bg-white rounded-2xl shadow-soft p-2 w-fit">
        {periods.map((p) => (
          <button key={p.value} onClick={() => setPeriod(p.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              period === p.value ? "bg-primary text-white" : "text-textLight hover:text-textDark"
            }`}>
            {p.label}
          </button>
        ))}
      </div>

      {loading ? <StatsSkeleton /> : error ? (
        <div className="bg-white rounded-2xl shadow-soft p-8 text-center text-danger text-sm">{error}</div>
      ) : data ? (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl shadow-soft p-4">
              <p className="text-xs text-textLight mb-1">Complétions</p>
              <p className="text-2xl font-bold text-primary">{data.summary.totalCompleted}</p>
              <p className="text-xs text-textLight mt-0.5">sur {period} jours</p>
            </div>
            <div className="bg-white rounded-2xl shadow-soft p-4">
              <p className="text-xs text-textLight mb-1">Taux moyen</p>
              <p className="text-2xl font-bold text-accent">{data.avgCompletionRate}%</p>
              <div className="flex items-center gap-1 mt-0.5">
                {data.trend !== 0 && (
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    data.trend > 0 ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                  }`}>
                    {data.trend > 0 ? "▲" : "▼"} {Math.abs(data.trend)}% vs début
                  </span>
                )}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-soft p-4">
              <p className="text-xs text-textLight mb-1">Dépenses</p>
              <p className="text-2xl font-bold text-danger">{formatCurrency(data.summary.totalExpenses)}</p>
              {data.totalIncome > 0 && (
                <p className="text-[10px] text-success mt-0.5">+{formatCurrency(data.totalIncome)} revenus</p>
              )}
            </div>
            <div className="bg-white rounded-2xl shadow-soft p-4">
              <p className="text-xs text-textLight mb-1">Habitudes actives</p>
              <p className="text-2xl font-bold text-success">{data.summary.habitsCount}</p>
              {data.bestDayOfWeek && (
                <p className="text-[10px] text-textLight mt-0.5">🏆 {data.bestDayOfWeek.label} ({data.bestDayOfWeek.rate}%)</p>
              )}
            </div>
          </div>

          {/* Tendance + Jour productif */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow-soft p-4 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                data.trend > 0 ? "bg-success/10" : data.trend < 0 ? "bg-danger/10" : "bg-gray-100"
              }`}>
                {data.trend > 0 ? "📈" : data.trend < 0 ? "📉" : "➡️"}
              </div>
              <div>
                <p className="text-xs text-textLight">Tendance sur la période</p>
                <p className="font-bold text-textDark">
                  {data.trend > 0 ? "En progression" : data.trend < 0 ? "En baisse" : "Stable"}
                </p>
                <p className="text-xs text-textLight mt-0.5">
                  {data.avgFirst}% → {data.avgSecond}%{" "}
                  <span className={data.trend >= 0 ? "text-success" : "text-danger"}>
                    ({data.trend >= 0 ? "+" : ""}{data.trend}%)
                  </span>
                </p>
              </div>
            </div>

            {data.bestDayOfWeek && (
              <div className="bg-white rounded-2xl shadow-soft p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center text-2xl">🏆</div>
                <div>
                  <p className="text-xs text-textLight">Ton jour le plus productif</p>
                  <p className="font-bold text-textDark">{data.bestDayOfWeek.label}</p>
                  <p className="text-xs text-textLight mt-0.5">{data.bestDayOfWeek.rate}% de complétion en moyenne</p>
                </div>
              </div>
            )}
          </div>

          {/* Calendrier de contributions */}
          <ContributionGrid days={data.days} />

          {/* Graphique complétion */}
          <div className="bg-white rounded-2xl shadow-soft p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-textDark">Taux de complétion — {period} jours</h3>
              <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-1 rounded-lg">
                {data.avgCompletionRate}% moy.
              </span>
            </div>
            {data.days.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.days}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false}
                    interval={period === 7 ? 0 : period === 30 ? 4 : 13} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false}
                    tickFormatter={(v: number) => `${v}%`} width={36} />
                  <Tooltip formatter={(value: number) => [`${value}%`, "Taux"]}
                    contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }} />
                  <Line type="monotone" dataKey="rate" stroke="#5B5EA6" strokeWidth={2.5}
                    dot={false} activeDot={{ r: 5, fill: "#5B5EA6" }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-textLight text-center py-8">Aucune donnée pour cette période.</p>
            )}
          </div>

          {/* Top habitudes */}
          {data.topHabits.length > 0 && (
            <div className="bg-white rounded-2xl shadow-soft p-4">
              <h3 className="text-sm font-semibold text-textDark mb-4">Top habitudes par complétion</h3>
              <div className="space-y-3">
                {data.topHabits.map((h, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                      style={{ backgroundColor: `${h.color}25` }}>
                      {h.icon ?? "✅"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs font-medium text-textDark truncate">{h.name}</p>
                        <span className="text-xs font-bold text-primary ml-2 shrink-0">{h.rate}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${h.rate}%`, backgroundColor: h.color }} />
                      </div>
                    </div>
                    <span className="text-[10px] text-textLight shrink-0">{h.completions}×</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dépenses par catégorie + par mois */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pie catégories */}
            {data.expensesByCategory.length > 0 && (
              <div className="bg-white rounded-2xl shadow-soft p-4">
                <h3 className="text-sm font-semibold text-textDark mb-4">Dépenses par catégorie</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={data.expensesByCategory} dataKey="amount" nameKey="category"
                      cx="50%" cy="50%" outerRadius={70} innerRadius={38}>
                      {data.expensesByCategory.map((entry, i) => (
                        <Cell key={i} fill={CATEGORY_COLORS[entry.category] ?? "#888"} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                  {data.expensesByCategory.slice(0, 6).map((e, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[e.category] ?? "#888" }} />
                      <span className="text-[10px] text-textLight truncate max-w-[80px]">{e.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bar mois */}
            {data.expensesChart.length > 0 && (
              <div className="bg-white rounded-2xl shadow-soft p-4">
                <h3 className="text-sm font-semibold text-textDark mb-4">Dépenses par mois</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={data.expensesChart} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false}
                      tickFormatter={(v: number) => `${v}€`} width={44} />
                    <Tooltip formatter={(value: number) => [formatCurrency(value), "Total"]}
                      contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }} />
                    <Bar dataKey="total" fill="#9B72CF" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Dépenses vs Revenus */}
          {(data.summary.totalExpenses > 0 || data.totalIncome > 0) && (
            <div className="bg-white rounded-2xl shadow-soft p-4">
              <h3 className="text-sm font-semibold text-textDark mb-4">Dépenses vs Revenus — {period} jours</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-success font-medium">Revenus</span>
                    <span className="text-success font-bold">+{formatCurrency(data.totalIncome)}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-success rounded-full transition-all"
                      style={{ width: data.totalIncome > 0 ? "100%" : "0%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-danger font-medium">Dépenses</span>
                    <span className="text-danger font-bold">-{formatCurrency(data.summary.totalExpenses)}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-danger rounded-full transition-all" style={{
                      width: data.totalIncome > 0
                        ? `${Math.min(Math.round((data.summary.totalExpenses / data.totalIncome) * 100), 100)}%`
                        : "100%"
                    }} />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                  <span className="text-xs text-textLight">Solde net</span>
                  <span className={`text-sm font-bold ${
                    data.totalIncome - data.summary.totalExpenses >= 0 ? "text-success" : "text-danger"
                  }`}>
                    {data.totalIncome - data.summary.totalExpenses >= 0 ? "+" : ""}
                    {formatCurrency(data.totalIncome - data.summary.totalExpenses)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Stats objectifs */}
          {data.goalsStats.total > 0 && (
            <div className="bg-white rounded-2xl shadow-soft p-4">
              <h3 className="text-sm font-semibold text-textDark mb-4">Objectifs</h3>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <p className="text-xl font-bold text-primary">{data.goalsStats.active}</p>
                  <p className="text-[10px] text-textLight mt-0.5">En cours</p>
                </div>
                <div className="text-center border-x border-gray-100">
                  <p className="text-xl font-bold text-success">{data.goalsStats.completed}</p>
                  <p className="text-[10px] text-textLight mt-0.5">Complétés</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-accent">{data.goalsStats.globalPct}%</p>
                  <p className="text-[10px] text-textLight mt-0.5">Progression</p>
                </div>
              </div>
              {data.goalsStats.bestGoal && (
                <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: `${data.goalsStats.bestGoal.color}20` }}>
                    {data.goalsStats.bestGoal.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-textDark truncate">{data.goalsStats.bestGoal.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${data.goalsStats.bestGoal.pct}%`, backgroundColor: data.goalsStats.bestGoal.color }} />
                      </div>
                      <span className="text-[10px] font-bold text-primary shrink-0">{data.goalsStats.bestGoal.pct}%</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-textLight shrink-0">Le + avancé</span>
                </div>
              )}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
