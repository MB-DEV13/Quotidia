"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { HabitForm } from "./HabitForm";
import { HabitCard } from "./HabitCard";

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

interface HabitsClientProps {
  initialHabits: Habit[];
  canAddMore: boolean;
  isPremium: boolean;
}

const SUGGESTED_HABITS = [
  { name: "Méditation",        icon: "🧘", color: "#9B72CF", frequency: "daily" },
  { name: "Sport",             icon: "🏃", color: "#4CAF50", frequency: "daily" },
  { name: "Lecture",           icon: "📚", color: "#5B5EA6", frequency: "daily" },
  { name: "Hydratation",       icon: "💧", color: "#0EA5E9", frequency: "daily" },
  { name: "Étirements",        icon: "🤸", color: "#FF9800", frequency: "daily" },
  { name: "Alimentation saine",icon: "🥗", color: "#4CAF50", frequency: "daily" },
];

export function HabitsClient({ initialHabits, canAddMore, isPremium }: HabitsClientProps) {
  const router = useRouter();
  const ph = usePostHog();
  const [habits, setHabits] = useState(initialHabits);

  // Sync depuis le serveur après chaque router.refresh()
  useEffect(() => { setHabits(initialHabits); }, [initialHabits]);
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [prefillData, setPrefillData] = useState<{ name: string; icon: string; color: string; frequency: string } | null>(null);

  const activeHabits = habits.filter((h) => !h.isArchived);
  const archivedHabits = habits.filter((h) => h.isArchived);

  async function handleCreate(data: { name: string; icon?: string; color: string; frequency: string }) {
    const res = await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      ph.capture("habit_created", { frequency: data.frequency, is_premium: isPremium });
      setShowForm(false);
      setPrefillData(null);
      router.refresh();
    }
  }

  async function handleEdit(data: { name: string; icon?: string; color: string; frequency: string }) {
    if (!editingHabit) return;
    const res = await fetch(`/api/habits/${editingHabit.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setEditingHabit(null);
      router.refresh();
    }
  }

  async function handleArchive(id: string) {
    const res = await fetch(`/api/habits/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: true }),
    });
    if (res.ok) { router.refresh(); }
  }

  async function handleUnarchive(id: string) {
    const res = await fetch(`/api/habits/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: false }),
    });
    if (res.ok) { router.refresh(); }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/habits/${id}`, { method: "DELETE" });
    if (res.ok) { router.refresh(); }
  }

  function openSuggestion(s: typeof SUGGESTED_HABITS[0]) {
    setPrefillData({ name: s.name, icon: s.icon, color: s.color, frequency: s.frequency });
    setShowForm(true);
  }

  return (
    <div>
      {/* Bouton ajouter ou limite atteinte */}
      {canAddMore ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-2xl mb-6 transition flex items-center justify-center gap-2"
        >
          <span className="text-xl leading-none">+</span>
          Ajouter une habitude
        </button>
      ) : (
        <div className="w-full bg-accent/10 border border-accent/20 rounded-2xl mb-6 p-4 text-center">
          <p className="text-sm font-medium text-accent mb-1">Limite gratuite atteinte (3 habitudes)</p>
          <p className="text-xs text-textLight">
            Passe en <span className="text-accent font-semibold">Premium</span> pour des habitudes illimitées.
          </p>
        </div>
      )}

      {/* Modal création */}
      {showForm && (
        <HabitForm
          onSubmit={handleCreate}
          onCancel={() => { setShowForm(false); setPrefillData(null); }}
          initialValues={prefillData ?? undefined}
        />
      )}

      {/* Modal édition */}
      {editingHabit && (
        <HabitForm
          editMode
          initialValues={{
            name: editingHabit.name,
            icon: editingHabit.icon ?? "✅",
            color: editingHabit.color,
            frequency: editingHabit.frequency,
          }}
          onSubmit={handleEdit}
          onCancel={() => setEditingHabit(null)}
        />
      )}

      {/* Habitudes actives */}
      <div className="space-y-3">
        {activeHabits.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-soft p-6 text-center">
            <p className="text-3xl mb-2">🌱</p>
            <p className="text-textDark font-semibold mb-1">Aucune habitude pour l&apos;instant</p>
            <p className="text-textLight text-sm">Crée ta première habitude ci-dessus !</p>
          </div>
        ) : (
          activeHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onArchive={handleArchive}
              onUnarchive={handleUnarchive}
              onDelete={handleDelete}
              onEdit={setEditingHabit}
            />
          ))
        )}
      </div>

      {/* Suggestions — toujours affichées */}
      <div className="mt-6">
        <p className="text-sm font-semibold text-textLight uppercase tracking-wide mb-3">Suggestions populaires</p>
        <div className="space-y-3">
          {SUGGESTED_HABITS.map((s) => (
            <button
              key={s.name}
              onClick={() => openSuggestion(s)}
              className="w-full bg-white rounded-2xl shadow-soft p-4 relative border-l-4 flex items-center gap-3 hover:shadow-card transition text-left"
              style={{ borderLeftColor: s.color }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ backgroundColor: `${s.color}30` }}
              >
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-textDark">{s.name}</p>
                <p className="text-xs text-textLight mt-0.5">Quotidien · Cliquer pour personnaliser</p>
              </div>
              <span className="text-xs text-primary font-semibold shrink-0">+ Ajouter</span>
            </button>
          ))}
        </div>
      </div>

      {/* Habitudes archivées */}
      {archivedHabits.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setShowArchived((v) => !v)}
            className="text-sm text-textLight hover:text-textDark transition mb-3 flex items-center gap-1"
          >
            <span>{showArchived ? "▾" : "▸"}</span>
            Archivées ({archivedHabits.length})
          </button>
          {showArchived && (
            <div className="space-y-3 opacity-70">
              {archivedHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onArchive={handleArchive}
                  onUnarchive={handleUnarchive}
                  onDelete={handleDelete}
                  onEdit={setEditingHabit}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
