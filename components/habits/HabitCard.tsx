"use client";

import { useState } from "react";
import { getFrequencyLabel } from "@/lib/utils";

interface Habit {
  id: string;
  name: string;
  icon: string | null;
  color: string;
  frequency: string;
  currentStreak: number;
  bestStreak: number;
  isArchived: boolean;
  completions: { date: Date | string }[];
}

interface HabitCardProps {
  habit: Habit;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (habit: Habit) => void;
}

export function HabitCard({ habit, onArchive, onUnarchive, onDelete, onEdit }: HabitCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Mini-calendrier 7 jours
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const completedDates = new Set(
    habit.completions.map((c) => new Date(c.date).toISOString().slice(0, 10))
  );

  function closeMenu() { setMenuOpen(false); setConfirmDelete(false); }

  return (
    <div className="bg-white rounded-2xl shadow-soft p-4 relative border-l-4" style={{ borderLeftColor: habit.color }}>
      <div className="flex items-start justify-between">
        {/* Icône + infos */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 mt-0.5"
            style={{ backgroundColor: `${habit.color}30` }}
          >
            {habit.icon || "✅"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-textDark truncate">{habit.name}</p>
            <p className="text-xs text-textLight mt-0.5">
              {getFrequencyLabel(habit.frequency)}
              {habit.currentStreak > 0 && (
                <span className="ml-2">🔥 <span className="font-semibold text-warning">{habit.currentStreak}j</span></span>
              )}
              {habit.bestStreak > 1 && habit.bestStreak > habit.currentStreak && (
                <span className="ml-2 text-textLight/70">record : {habit.bestStreak}j</span>
              )}
            </p>

            {/* Mini-calendrier 7 jours */}
            <div className="flex gap-1 mt-2">
              {last7.map((day, i) => (
                <div
                  key={i}
                  title={new Date(day + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" })}
                  className={`w-4 h-4 rounded-sm transition-colors ${
                    completedDates.has(day) ? "bg-success" : "bg-gray-100"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Menu ⋯ */}
        <div className="relative shrink-0 ml-2">
          <button
            onClick={() => { setMenuOpen((v) => !v); setConfirmDelete(false); }}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-textLight text-lg"
            aria-label="Options"
          >
            ⋯
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={closeMenu} />
              <div className="absolute right-0 top-9 bg-white rounded-xl shadow-card border border-gray-100 z-20 min-w-[160px] py-1">

                {/* Modifier */}
                {!habit.isArchived && (
                  <button
                    onClick={() => { onEdit(habit); closeMenu(); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-textDark hover:bg-gray-50 transition flex items-center gap-2"
                  >
                    <span>✏️</span> Modifier
                  </button>
                )}

                {/* Archiver / Restaurer */}
                {!habit.isArchived ? (
                  <button
                    onClick={() => { onArchive(habit.id); closeMenu(); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-textDark hover:bg-gray-50 transition flex items-center gap-2"
                  >
                    <span>📦</span> Archiver
                  </button>
                ) : (
                  <button
                    onClick={() => { onUnarchive(habit.id); closeMenu(); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-textDark hover:bg-gray-50 transition flex items-center gap-2"
                  >
                    <span>♻️</span> Restaurer
                  </button>
                )}

                {/* Supprimer */}
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition flex items-center gap-2"
                  >
                    <span>🗑️</span> Supprimer
                  </button>
                ) : (
                  <div className="px-3 py-2 border-t border-gray-100">
                    <p className="text-xs text-textDark mb-2">Confirmer la suppression ?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="flex-1 py-1.5 text-xs rounded-lg border border-gray-200 text-textLight hover:bg-gray-50 transition"
                      >
                        Non
                      </button>
                      <button
                        onClick={() => { onDelete(habit.id); closeMenu(); }}
                        className="flex-1 py-1.5 text-xs rounded-lg bg-danger text-white hover:bg-danger/90 transition font-medium"
                      >
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
    </div>
  );
}
