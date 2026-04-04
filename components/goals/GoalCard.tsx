"use client";

import { useState, useEffect } from "react";

export interface Goal {
  id: string;
  title: string;
  icon: string;
  color: string;
  target: number;
  current: number;
  unit: string | null;
  deadline: string | null;
  createdAt: string;
}

interface GoalCardProps {
  goal: Goal;
  onUpdate: (id: string, current: number) => Promise<{ justCompleted: boolean }>;
  onDelete: (id: string) => void;
  onEdit: (goal: Goal) => void;
  onRestart?: (id: string) => void;
}

function getDaysRemaining(deadline: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(deadline);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getDeadlineBadge(days: number): { label: string; className: string } {
  if (days < 0) return { label: `En retard de ${Math.abs(days)}j`, className: "bg-danger/10 text-danger" };
  if (days === 0) return { label: "Aujourd'hui !", className: "bg-danger/10 text-danger" };
  if (days <= 7) return { label: `Dans ${days}j`, className: "bg-danger/10 text-danger" };
  if (days <= 30) return { label: `Dans ${days}j`, className: "bg-warning/10 text-warning" };
  return { label: `Dans ${days}j`, className: "bg-success/10 text-success" };
}

function getPaceText(goal: Goal): string | null {
  if (!goal.deadline || goal.current >= goal.target) return null;
  const days = getDaysRemaining(goal.deadline);
  if (days <= 0) return null;
  const remaining = goal.target - goal.current;
  const unit = goal.unit ?? "unités";
  if (days >= 14) {
    const perWeek = (remaining / days) * 7;
    const rounded = Math.round(perWeek * 10) / 10;
    return `+${rounded} ${unit}/semaine pour tenir le rythme`;
  }
  const perDay = remaining / days;
  const rounded = Math.round(perDay * 10) / 10;
  return `+${rounded} ${unit}/jour pour tenir le rythme`;
}

function getBarColor(goal: Goal, isCompleted: boolean): string {
  if (isCompleted) return "bg-success";
  if (!goal.deadline) return "bg-primary";
  const days = getDaysRemaining(goal.deadline);
  if (days < 0) return "bg-danger";
  // Est-on en retard par rapport au rythme théorique ?
  const totalDays = Math.round(
    (new Date(goal.deadline).getTime() - new Date(goal.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (totalDays <= 0) return "bg-primary";
  const expectedPct = Math.min(((totalDays - days) / totalDays) * 100, 100);
  const actualPct = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
  if (actualPct < expectedPct - 15) return "bg-warning"; // en retard de >15%
  return "bg-primary";
}

export function GoalCard({ goal, onUpdate, onDelete, onEdit, onRestart }: GoalCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [incrementInput, setIncrementInput] = useState("");
  const [showIncrement, setShowIncrement] = useState(false);
  const [loading, setLoading] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [showXP, setShowXP] = useState(false);

  const percentage = goal.target > 0 ? Math.min(Math.round((goal.current / goal.target) * 100), 100) : 0;
  const isCompleted = goal.current >= goal.target;
  const daysRemaining = goal.deadline ? getDaysRemaining(goal.deadline) : null;
  const deadlineBadge = goal.deadline && !isCompleted ? getDeadlineBadge(daysRemaining!) : null;
  const paceText = getPaceText(goal);
  const barColor = getBarColor(goal, isCompleted);

  useEffect(() => {
    if (justCompleted) {
      setShowXP(true);
      const t = setTimeout(() => {
        setJustCompleted(false);
        setShowXP(false);
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [justCompleted]);

  async function handleIncrement(value: number) {
    setLoading(true);
    const result = await onUpdate(goal.id, goal.current + value);
    if (result.justCompleted) {
      setJustCompleted(true);
    }
    setIncrementInput("");
    setShowIncrement(false);
    setLoading(false);
  }

  async function handleCustomIncrement(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(incrementInput);
    if (isNaN(value) || value === 0) return;
    await handleIncrement(value);
  }

  return (
    <div
      className={`bg-white rounded-2xl shadow-soft p-5 relative border-l-4 transition-all ${
        justCompleted ? "ring-2 ring-success/40" : isCompleted ? "ring-1 ring-success/20" : ""
      }`}
      style={{ borderLeftColor: goal.color }}
    >
      {/* Animation complétion */}
      {justCompleted && (
        <div className="absolute inset-0 rounded-2xl bg-success/5 pointer-events-none z-10 flex items-center justify-center">
          <div className="bg-success text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg animate-bounce">
            🎉 Objectif atteint ! +150 XP
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0 pr-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
            style={{ backgroundColor: `${goal.color}20` }}
          >
            {goal.icon}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-textDark text-sm leading-tight truncate">{goal.title}</h3>
            {deadlineBadge && (
              <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${deadlineBadge.className}`}>
                ⏱ {deadlineBadge.label}
              </span>
            )}
            {isCompleted && !justCompleted && (
              <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 bg-success/10 text-success">
                ✅ Complété
              </span>
            )}
          </div>
        </div>

        {/* Menu (toujours visible) */}
        <div className="relative shrink-0">
          <button
            onClick={() => { setMenuOpen((v) => !v); setConfirmDelete(false); }}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-textLight text-lg"
            aria-label="Options"
          >
            ⋯
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => { setMenuOpen(false); setConfirmDelete(false); }} />
              <div className="absolute right-0 top-9 bg-white rounded-xl shadow-card border border-gray-100 z-20 min-w-[160px] py-1">
                <button
                  onClick={() => { onEdit(goal); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-textDark hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <span>✏️</span> Modifier
                </button>
                {isCompleted && onRestart && (
                  <button
                    onClick={() => { onRestart(goal.id); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-primary hover:bg-primary/5 transition flex items-center gap-2"
                  >
                    <span>🔄</span> Relancer
                  </button>
                )}
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition flex items-center gap-2"
                  >
                    <span>🗑️</span> Supprimer
                  </button>
                ) : (
                  <div className="px-3 py-2 border-t border-gray-100">
                    <p className="text-xs text-textDark mb-2">Confirmer ?</p>
                    <div className="flex gap-2">
                      <button onClick={() => setConfirmDelete(false)}
                        className="flex-1 py-1.5 text-xs rounded-lg border border-gray-200 text-textLight hover:bg-gray-50 transition">
                        Non
                      </button>
                      <button onClick={() => { onDelete(goal.id); setMenuOpen(false); }}
                        className="flex-1 py-1.5 text-xs rounded-lg bg-danger text-white hover:bg-danger/90 transition font-medium">
                        Oui
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1.5 text-xs">
          <span className="text-textLight">
            {goal.current} / {goal.target}{goal.unit ? ` ${goal.unit}` : ""}
          </span>
          <span className={`font-bold ${isCompleted ? "text-success" : "text-primary"}`}>
            {percentage}%
          </span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {paceText && (
          <p className="text-[10px] text-textLight mt-1 italic">{paceText}</p>
        )}
      </div>

      {/* Incrément rapide */}
      {!isCompleted && (
        <div className="mt-3">
          {!showIncrement ? (
            <div className="flex items-center gap-2 flex-wrap">
              {[1, 5, 10].map((v) => (
                <button
                  key={v}
                  onClick={() => handleIncrement(v)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-gray-200 text-textDark hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  +{v}{goal.unit ? ` ${goal.unit}` : ""}
                </button>
              ))}
              <button
                onClick={() => setShowIncrement(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-primary/30 text-primary hover:bg-primary/5 transition"
              >
                + Autre
              </button>
            </div>
          ) : (
            <form onSubmit={handleCustomIncrement} className="flex gap-2">
              <input
                type="number" step="any" value={incrementInput}
                onChange={(e) => setIncrementInput(e.target.value)}
                placeholder={`+${goal.unit ?? "valeur"}`}
                autoFocus
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
              <button type="submit" disabled={loading || !incrementInput}
                className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-semibold disabled:opacity-60 transition">
                {loading ? "..." : "OK"}
              </button>
              <button type="button"
                onClick={() => { setShowIncrement(false); setIncrementInput(""); }}
                className="px-3 py-2 rounded-xl border border-gray-200 text-xs text-textLight hover:bg-gray-50 transition">
                ✕
              </button>
            </form>
          )}
        </div>
      )}

      {isCompleted && !justCompleted && (
        <p className="text-xs text-success font-medium mt-2">✅ Objectif atteint !</p>
      )}
    </div>
  );
}
