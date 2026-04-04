"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import Link from "next/link";
import { getStreakMultiplierLabel } from "@/lib/gamification";

interface Habit {
  id: string;
  name: string;
  icon: string | null;
  color: string;
  currentStreak: number;
  completions: { id: string }[];
}

interface HabitsSummaryProps {
  habits: Habit[];
}

export function HabitsSummary({ habits }: HabitsSummaryProps) {
  const router = useRouter();
  const ph = usePostHog();
  const [completing, setCompleting] = useState<string | null>(null);

  // Habitudes déjà complétées au chargement → cachées d'emblée
  const initialDone = new Set(habits.filter((h) => h.completions.length > 0).map((h) => h.id));
  const [localCompletions, setLocalCompletions] = useState<Set<string>>(initialDone);
  const [animatingOut, setAnimatingOut] = useState<Set<string>>(new Set());
  const [removed, setRemoved] = useState<Set<string>>(new Set(initialDone));

  // Badge notification
  const [newBadge, setNewBadge] = useState<{ name: string; icon: string } | null>(null);
  useEffect(() => {
    if (!newBadge) return;
    const t = setTimeout(() => setNewBadge(null), 5000);
    return () => clearTimeout(t);
  }, [newBadge]);

  const total = habits.length;
  const doneCount = localCompletions.size;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const isAllDone = total > 0 && doneCount === total;

  async function handleComplete(habitId: string) {
    if (localCompletions.has(habitId) || completing === habitId) return;
    setCompleting(habitId);
    try {
      const res = await fetch(`/api/habits/${habitId}/complete`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setLocalCompletions((prev) => new Set([...prev, habitId]));

        const habit = habits.find((h) => h.id === habitId);
        ph.capture("habit_completed", {
          streak: habit?.currentStreak ?? 0,
          badge_unlocked: data.data?.newBadges?.length > 0,
        });

        // Badge débloqué ?
        if (data.data?.newBadges?.length > 0) {
          setNewBadge(data.data.newBadges[0]);
        }

        // Après 600ms (bref affichage du ✓), lancer l'animation de sortie
        setTimeout(() => {
          setAnimatingOut((prev) => new Set([...prev, habitId]));
          // Après l'animation (350ms), supprimer de la liste
          setTimeout(() => {
            setRemoved((prev) => new Set([...prev, habitId]));
            setAnimatingOut((prev) => { const s = new Set(prev); s.delete(habitId); return s; });
            router.refresh();
          }, 350);
        }, 600);
      }
    } finally {
      setCompleting(null);
    }
  }

  if (habits.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-soft p-8 text-center">
        <p className="text-4xl mb-3">🌱</p>
        <p className="text-textDark font-semibold mb-1">Aucune habitude pour aujourd&apos;hui</p>
        <p className="text-textLight text-sm mb-4">Commence par créer ta première habitude !</p>
        <Link
          href="/habits"
          className="inline-block bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition"
        >
          + Créer une habitude
        </Link>
      </div>
    );
  }

  // Habitudes visibles (non supprimées), non complétées en premier
  const visibleHabits = habits
    .filter((h) => !removed.has(h.id) || animatingOut.has(h.id))
    .sort((a, b) => {
      const aDone = localCompletions.has(a.id) ? 1 : 0;
      const bDone = localCompletions.has(b.id) ? 1 : 0;
      return aDone - bDone;
    });

  return (
    <div className="bg-white rounded-2xl shadow-soft p-5">
      {/* Badge débloqué */}
      {newBadge && (
        <div className="mb-4 bg-accent/10 border border-accent/20 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-3xl">{newBadge.icon}</span>
          <div>
            <p className="text-xs font-semibold text-accent uppercase tracking-wide">Badge débloqué !</p>
            <p className="text-sm font-bold text-textDark">{newBadge.name}</p>
          </div>
          <button
            onClick={() => setNewBadge(null)}
            className="ml-auto text-textLight hover:text-textDark transition text-lg leading-none"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>
      )}

      {/* En-tête avec barre de progression */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-textDark">Habitudes du jour</h2>
        <span className={`text-sm font-bold ${isAllDone ? "text-success" : "text-primary"}`}>
          {doneCount}/{total}
        </span>
      </div>

      {/* Barre de progression globale */}
      <div className="mb-4 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isAllDone ? "bg-success" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Toutes complétées */}
      {isAllDone && (
        <div className="bg-success/10 border border-success/20 rounded-2xl p-4 text-center relative overflow-hidden">
          <style>{`
            @keyframes confetti-fall {
              0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
              100% { transform: translateY(60px) rotate(360deg); opacity: 0; }
            }
            .confetti-piece {
              position: absolute;
              width: 8px; height: 8px;
              border-radius: 2px;
              animation: confetti-fall 1.5s ease-in forwards;
            }
          `}</style>
          {["#5B5EA6","#9B72CF","#4CAF50","#FF9800","#0EA5E9","#EF4444"].map((color, i) => (
            <span key={i} className="confetti-piece" style={{ backgroundColor: color, left: `${10 + i * 15}%`, top: "8px", animationDelay: `${i * 0.15}s` }} />
          ))}
          <p className="text-2xl mb-1">🎉</p>
          <p className="text-success font-bold text-sm">Toutes les habitudes complétées !</p>
          <p className="text-success/70 text-xs mt-0.5">Excellent travail aujourd&apos;hui !</p>
        </div>
      )}

      {/* Liste des habitudes */}
      {!isAllDone && (
        <div>
          {visibleHabits.map((habit) => {
            const isDone = localCompletions.has(habit.id);
            const isLoading = completing === habit.id;
            const isLeaving = animatingOut.has(habit.id);
            const multiplierLabel = getStreakMultiplierLabel(habit.currentStreak);

            return (
              <div
                key={habit.id}
                style={{
                  maxHeight: isLeaving ? "0px" : "120px",
                  opacity: isLeaving ? 0 : 1,
                  marginBottom: isLeaving ? "0px" : "12px",
                  overflow: "hidden",
                  transition: "max-height 0.35s ease, opacity 0.35s ease, margin-bottom 0.35s ease",
                }}
              >
                <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${habit.color}30` }}
                    >
                      {habit.icon || "✅"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`font-medium text-sm ${isDone ? "line-through text-textLight" : "text-textDark"}`}>
                          {habit.name}
                        </p>
                        {multiplierLabel && !isDone && (
                          <span className="text-xs font-bold bg-warning/10 text-warning px-1.5 py-0.5 rounded-full">
                            🔥 {multiplierLabel}
                          </span>
                        )}
                      </div>
                      {habit.currentStreak > 0 && (
                        <p className="text-xs text-textLight">
                          🔥 {habit.currentStreak} jour{habit.currentStreak > 1 ? "s" : ""} de streak
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleComplete(habit.id)}
                    disabled={isDone || isLoading}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      isDone
                        ? "bg-success text-white"
                        : "border-2 border-gray-200 hover:border-primary text-transparent hover:text-primary"
                    }`}
                    aria-label={isDone ? "Complété" : "Marquer comme fait"}
                  >
                    {isLoading ? (
                      <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
