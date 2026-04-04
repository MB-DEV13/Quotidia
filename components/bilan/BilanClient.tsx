"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { formatCurrency } from "@/lib/utils";

interface GoalProgress {
  title: string;
  icon: string;
  color: string;
  pct: number;
}

interface DayEntry {
  dayLabel: string;
  completed: number;
  total: number;
  rate: number;
}

interface StreakEntry {
  name: string;
  icon: string | null;
  streak: number;
  maintained: boolean;
}

interface BilanData {
  period: { start: string; end: string; label: string };
  habits: {
    completionRate: number;
    totalCompleted: number;
    totalPossible: number;
    bestHabit: { name: string; icon: string | null; count: number } | null;
  };
  expenses: {
    total: number;
    budget: number | null;
    overBudget: boolean;
    topCategories: { category: string; amount: number }[];
  };
  goals: GoalProgress[];
  motivationMessage: string;
  dayByDay: DayEntry[];
  xpThisWeek: number;
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  prevComparison: { rate: number; diff: number } | null;
  streakHighlights: StreakEntry[];
  navigation: { prevWeek: string; nextWeek: string; isCurrentWeek: boolean };
}

// --- Skeleton ---
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className ?? ""}`} />;
}
function BilanSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-24" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton className="h-20" />
      <Skeleton className="h-40" />
      <Skeleton className="h-32" />
      <Skeleton className="h-28" />
    </div>
  );
}

// --- Score grade config ---
const GRADE_CONFIG = {
  A: { label: "Excellent", color: "#4CAF50", bg: "bg-success/10", text: "text-success", border: "border-success/20" },
  B: { label: "Bien", color: "#9B72CF", bg: "bg-accent/10", text: "text-accent", border: "border-accent/20" },
  C: { label: "Correct", color: "#FF9800", bg: "bg-warning/10", text: "text-warning", border: "border-warning/20" },
  D: { label: "Peut mieux faire", color: "#F97316", bg: "bg-orange-50", text: "text-orange-500", border: "border-orange-200" },
  F: { label: "À reprendre", color: "#EF4444", bg: "bg-danger/10", text: "text-danger", border: "border-danger/20" },
};

function getDayColor(rate: number) {
  if (rate === 0) return "bg-gray-100";
  if (rate < 50) return "bg-success/25";
  if (rate < 80) return "bg-success/55";
  if (rate < 100) return "bg-success/80";
  return "bg-success";
}

export function BilanClient() {
  const [week, setWeek] = useState<string | null>(null);
  const [data, setData] = useState<BilanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bilanRef = useRef<HTMLDivElement>(null);

  const fetchBilan = useCallback(async (weekParam: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const url = weekParam ? `/api/bilan?week=${weekParam}` : "/api/bilan";
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Erreur chargement");
        return;
      }
      setData(json.data as BilanData);
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBilan(week); }, [week, fetchBilan]);

  async function handleDownloadPDF() {
    if (!data) return;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const primary = [91, 94, 166] as [number, number, number];
    const accent = [155, 114, 207] as [number, number, number];
    const gray = [136, 136, 136] as [number, number, number];
    const dark = [45, 45, 45] as [number, number, number];
    const success = [76, 175, 80] as [number, number, number];
    const danger = [239, 68, 68] as [number, number, number];
    const gradeColor = GRADE_CONFIG[data.grade].color;
    const gradeRgb = [
      parseInt(gradeColor.slice(1, 3), 16),
      parseInt(gradeColor.slice(3, 5), 16),
      parseInt(gradeColor.slice(5, 7), 16),
    ] as [number, number, number];

    let y = 20;
    const lm = 20; // left margin
    const pw = 170; // page width

    // Header
    doc.setFillColor(...primary);
    doc.roundedRect(lm, y, pw, 22, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Bilan Hebdomadaire — Quotidia", lm + 6, y + 9);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(data.period.label, lm + 6, y + 16);
    y += 30;

    // Score + XP
    doc.setFillColor(...gradeRgb);
    doc.roundedRect(lm, y, 40, 20, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(data.grade, lm + 15, y + 13);

    doc.setTextColor(...dark);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(GRADE_CONFIG[data.grade].label, lm + 46, y + 8);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...gray);
    doc.text(`Score global : ${data.score}/100`, lm + 46, y + 15);
    doc.text(`XP estimé cette semaine : +${data.xpThisWeek} XP`, lm + 46, y + 21);
    y += 30;

    // Message
    doc.setFillColor(245, 243, 255);
    doc.roundedRect(lm, y, pw, 12, 2, 2, "F");
    doc.setTextColor(...dark);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    const msgLines = doc.splitTextToSize(data.motivationMessage, pw - 8) as string[];
    doc.text(msgLines, lm + 4, y + 5);
    y += 18;

    // Section: Habitudes
    doc.setTextColor(...primary);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Habitudes", lm, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...dark);
    doc.text(`Taux de complétion : ${data.habits.completionRate}%  (${data.habits.totalCompleted}/${data.habits.totalPossible})`, lm, y);
    y += 5;

    if (data.prevComparison) {
      const diffText = data.prevComparison.diff >= 0
        ? `+${data.prevComparison.diff}% vs semaine précédente`
        : `${data.prevComparison.diff}% vs semaine précédente`;
      doc.setTextColor(...(data.prevComparison.diff >= 0 ? success : danger));
      doc.text(diffText, lm, y);
      doc.setTextColor(...dark);
      y += 5;
    }

    if (data.habits.bestHabit) {
      doc.text(`Habitude la plus régulière : ${data.habits.bestHabit.name} (${data.habits.bestHabit.count}x)`, lm, y);
      y += 8;
    }

    // Streaks
    if (data.streakHighlights.length > 0) {
      doc.setTextColor(...gray);
      doc.setFontSize(8);
      doc.text("Streaks :", lm, y);
      y += 5;
      for (const s of data.streakHighlights) {
        const status = s.maintained ? "✓" : "–";
        doc.text(`  ${status}  ${s.name}  —  ${s.streak} jour(s) de suite`, lm, y);
        y += 4;
      }
      y += 4;
    }

    // Section: Budget
    doc.setTextColor(...primary);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Budget", lm, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...dark);
    if (data.expenses.budget) {
      doc.text(`Dépenses : ${formatCurrency(data.expenses.total)} / ${formatCurrency(data.expenses.budget)}`, lm, y);
      y += 5;
      if (data.expenses.overBudget) {
        doc.setTextColor(...danger);
        doc.text(`Dépassement : +${formatCurrency(data.expenses.total - data.expenses.budget!)}`, lm, y);
      } else {
        doc.setTextColor(...success);
        doc.text(`Solde restant : ${formatCurrency(data.expenses.budget - data.expenses.total)}`, lm, y);
      }
      doc.setTextColor(...dark);
      y += 5;
    } else {
      doc.text(`Total dépenses : ${formatCurrency(data.expenses.total)}`, lm, y);
      y += 5;
    }

    if (data.expenses.topCategories.length > 0) {
      doc.setTextColor(...gray);
      doc.setFontSize(8);
      for (const cat of data.expenses.topCategories) {
        doc.text(`  • ${cat.category} : ${formatCurrency(cat.amount)}`, lm, y);
        y += 4;
      }
      y += 4;
    }

    // Section: Objectifs
    if (data.goals.length > 0) {
      doc.setTextColor(...primary);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Objectifs", lm, y);
      y += 6;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      for (const g of data.goals) {
        doc.setTextColor(...dark);
        doc.text(`${g.title}`, lm, y);
        doc.setTextColor(...accent);
        doc.text(`${g.pct}%`, lm + pw - 12, y);
        doc.setTextColor(...dark);
        y += 5;
      }
      y += 4;
    }

    // Footer
    doc.setDrawColor(230, 230, 230);
    doc.line(lm, y, lm + pw, y);
    y += 5;
    doc.setFontSize(7);
    doc.setTextColor(...gray);
    doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")} par Quotidia — myquotidia.app`, lm, y);

    doc.save(`bilan-${data.period.label.replace(/\s/g, "-")}.pdf`);
  }

  return (
    <div className="space-y-5">
      {/* Navigation semaines */}
      <div className="flex items-center justify-between bg-white rounded-2xl shadow-soft px-5 py-3">
        <button
          onClick={() => data && setWeek(data.navigation.prevWeek)}
          disabled={loading}
          className="text-sm text-primary hover:text-primary/80 transition disabled:opacity-40 font-medium"
        >
          ← Précédente
        </button>
        <span className="text-sm font-medium text-textDark">
          {loading ? "Chargement..." : (data?.period.label ?? "—")}
        </span>
        <button
          onClick={() => data && !data.navigation.isCurrentWeek && setWeek(data.navigation.nextWeek)}
          disabled={loading || data?.navigation.isCurrentWeek}
          className="text-sm text-primary hover:text-primary/80 transition disabled:opacity-40 font-medium"
        >
          Suivante →
        </button>
      </div>

      {error && (
        <div className="bg-white rounded-2xl shadow-soft p-6 text-center text-danger text-sm">{error}</div>
      )}

      {loading ? <BilanSkeleton /> : data ? (
        <div ref={bilanRef} className="space-y-5">
          {/* Score global */}
          {(() => {
            const cfg = GRADE_CONFIG[data.grade];
            return (
              <div className={`rounded-2xl p-5 border ${cfg.bg} ${cfg.border} flex items-center gap-5`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0`}
                  style={{ backgroundColor: cfg.color }}>
                  <span className="text-3xl font-black text-white">{data.grade}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-lg font-bold ${cfg.text}`}>{cfg.label}</p>
                  <p className="text-xs text-textLight mt-0.5">{data.motivationMessage}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs bg-white/80 rounded-full px-2 py-0.5 font-medium text-textDark">
                      Score {data.score}/100
                    </span>
                    <span className="text-xs bg-white/80 rounded-full px-2 py-0.5 font-medium text-accent">
                      +{data.xpThisWeek} XP
                    </span>
                    {data.prevComparison && data.prevComparison.diff !== 0 && (
                      <span className={`text-xs rounded-full px-2 py-0.5 font-medium bg-white/80 ${
                        data.prevComparison.diff > 0 ? "text-success" : "text-danger"
                      }`}>
                        {data.prevComparison.diff > 0 ? "▲" : "▼"} {Math.abs(data.prevComparison.diff)}% vs S-1
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Grille jour par jour */}
          <div className="bg-white rounded-2xl shadow-soft p-5">
            <h2 className="text-sm font-semibold text-textLight uppercase tracking-wide mb-4">
              Complétion par jour
            </h2>
            <div className="grid grid-cols-7 gap-2">
              {data.dayByDay.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div className={`w-full aspect-square rounded-xl ${getDayColor(d.rate)} flex items-center justify-center transition-transform hover:scale-105`}
                    title={`${d.dayLabel} — ${d.rate}%`}>
                    {d.rate === 100 && <span className="text-xs text-white font-bold">✓</span>}
                  </div>
                  <span className="text-[10px] text-textLight font-medium">{d.dayLabel}</span>
                  <span className="text-[10px] text-textDark font-bold">{d.rate}%</span>
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

          {/* Habitudes */}
          <div className="bg-white rounded-2xl shadow-soft p-5">
            <h2 className="text-sm font-semibold text-textLight uppercase tracking-wide mb-4">
              Habitudes
            </h2>
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-textDark font-medium">Taux de complétion</span>
                <span className={`font-bold ${
                  data.habits.completionRate >= 70 ? "text-success"
                  : data.habits.completionRate >= 40 ? "text-warning"
                  : "text-danger"
                }`}>
                  {data.habits.completionRate}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    data.habits.completionRate >= 70 ? "bg-success"
                    : data.habits.completionRate >= 40 ? "bg-warning"
                    : "bg-danger"
                  }`}
                  style={{ width: `${data.habits.completionRate}%` }}
                />
              </div>
              <p className="text-xs text-textLight mt-1">
                {data.habits.totalCompleted} / {data.habits.totalPossible} complétions
              </p>
            </div>

            {data.habits.bestHabit && (
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mt-2">
                <span className="text-xl">{data.habits.bestHabit.icon ?? "⭐"}</span>
                <div>
                  <p className="text-xs text-textLight">Habitude la plus régulière</p>
                  <p className="text-sm font-semibold text-textDark">{data.habits.bestHabit.name}</p>
                  <p className="text-xs text-primary">{data.habits.bestHabit.count} fois cette semaine</p>
                </div>
              </div>
            )}
          </div>

          {/* Streaks */}
          {data.streakHighlights.length > 0 && (
            <div className="bg-white rounded-2xl shadow-soft p-5">
              <h2 className="text-sm font-semibold text-textLight uppercase tracking-wide mb-3">
                Streaks
              </h2>
              <div className="space-y-2">
                {data.streakHighlights.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 ${
                      s.maintained ? "bg-warning/10" : "bg-gray-100"
                    }`}>
                      {s.maintained ? "🔥" : "💔"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-textDark truncate">{s.icon} {s.name}</p>
                      <p className={`text-xs ${s.maintained ? "text-warning" : "text-textLight"}`}>
                        {s.maintained
                          ? `${s.streak} jour${s.streak > 1 ? "s" : ""} de suite 🔥`
                          : "Pas de complétion cette semaine"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Budget */}
          <div className="bg-white rounded-2xl shadow-soft p-5">
            <h2 className="text-sm font-semibold text-textLight uppercase tracking-wide mb-4">
              Budget
            </h2>
            {data.expenses.budget ? (
              <>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-2xl font-bold text-textDark">
                    {formatCurrency(data.expenses.total)}
                  </span>
                  <span className="text-sm text-textLight mb-0.5">
                    / {formatCurrency(data.expenses.budget)} (budget hebdo)
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all ${data.expenses.overBudget ? "bg-danger" : "bg-success"}`}
                    style={{ width: `${Math.min(Math.round((data.expenses.total / data.expenses.budget) * 100), 100)}%` }}
                  />
                </div>
                {data.expenses.overBudget ? (
                  <p className="text-xs text-danger font-medium">
                    Dépassement de {formatCurrency(data.expenses.total - data.expenses.budget)}
                  </p>
                ) : (
                  <p className="text-xs text-success font-medium">
                    Dans les clous 👍 ({formatCurrency(data.expenses.budget - data.expenses.total)} restants)
                  </p>
                )}
              </>
            ) : (
              <p className="text-2xl font-bold text-textDark">{formatCurrency(data.expenses.total)}</p>
            )}

            {data.expenses.topCategories.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-textLight font-medium uppercase tracking-wide">Top catégories</p>
                {data.expenses.topCategories.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-textLight w-4 text-right">{i + 1}.</span>
                      <span className="text-sm text-textDark">{cat.category}</span>
                    </div>
                    <span className="text-sm font-semibold text-danger">{formatCurrency(cat.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Objectifs */}
          {data.goals.length > 0 && (
            <div className="bg-white rounded-2xl shadow-soft p-5">
              <h2 className="text-sm font-semibold text-textLight uppercase tracking-wide mb-4">
                Objectifs en cours
              </h2>
              <div className="space-y-3">
                {data.goals.map((goal, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-6 h-6 rounded-md flex items-center justify-center text-sm shrink-0"
                          style={{ backgroundColor: `${goal.color}20` }}
                        >
                          {goal.icon}
                        </span>
                        <p className="text-sm font-medium text-textDark">{goal.title}</p>
                      </div>
                      <span className={`text-xs font-bold ${goal.pct >= 100 ? "text-success" : "text-primary"}`}>
                        {goal.pct}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${goal.pct}%`,
                          backgroundColor: goal.pct >= 100 ? "#4CAF50" : goal.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bouton télécharger PDF */}
          <button
            onClick={handleDownloadPDF}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-primary/40 text-textDark hover:text-primary font-medium py-3 rounded-2xl shadow-soft transition text-sm"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M8 12l4 4m0 0l4-4m-4 4V4" />
            </svg>
            Télécharger en PDF
          </button>
        </div>
      ) : null}
    </div>
  );
}
