"use client";

import { useState, useEffect } from "react";
import { usePostHog } from "posthog-js/react";
import { useTranslations } from "next-intl";
import { HabitForm } from "./HabitForm";
import { HabitCard } from "./HabitCard";
import { FREE_LIMITS } from "@/lib/config";

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

interface SuggestedHabit {
  name: string;
  icon: string;
  color: string;
  frequency: string;
}

export function HabitsClient({ initialHabits, canAddMore, isPremium }: HabitsClientProps) {
  const ph = usePostHog();
  const t = useTranslations("habits");
  const [habits, setHabits] = useState(initialHabits);

  useEffect(() => { setHabits(initialHabits); }, [initialHabits]);
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [prefillData, setPrefillData] = useState<{ name: string; icon: string; color: string; frequency: string } | null>(null);

  const activeHabits = habits.filter((h) => !h.isArchived);
  const archivedHabits = habits.filter((h) => h.isArchived);

  const suggestedHabits = t.raw("suggested.list") as SuggestedHabit[];

  async function handleCreate(data: { name: string; icon?: string; color: string; frequency: string }) {
    const res = await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const json = await res.json();
      ph.capture("habit_created", { frequency: data.frequency, is_premium: isPremium });
      setShowForm(false);
      setPrefillData(null);
      // Ajout optimiste
      setHabits((prev) => [{ ...json.data, completions: [] }, ...prev]);
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
      // Mise à jour optimiste
      setHabits((prev) => prev.map((h) =>
        h.id === editingHabit.id ? { ...h, ...data } : h
      ));
    }
  }

  async function handleArchive(id: string) {
    const res = await fetch(`/api/habits/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: true }),
    });
    if (res.ok) {
      setHabits((prev) => prev.map((h) => h.id === id ? { ...h, isArchived: true } : h));
    }
  }

  async function handleUnarchive(id: string) {
    const res = await fetch(`/api/habits/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: false }),
    });
    if (res.ok) {
      setHabits((prev) => prev.map((h) => h.id === id ? { ...h, isArchived: false } : h));
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/habits/${id}`, { method: "DELETE" });
    if (res.ok) {
      setHabits((prev) => prev.filter((h) => h.id !== id));
    }
  }

  function openSuggestion(s: SuggestedHabit) {
    setPrefillData({ name: s.name, icon: s.icon, color: s.color, frequency: s.frequency });
    setShowForm(true);
  }

  return (
    <div>
      {/* Bandeau freemium */}
      {!isPremium && (
        <div className="mb-4 bg-accent/5 border border-accent/20 rounded-2xl px-4 py-3 text-center">
          <p className="text-xs text-textLight">
            Compte gratuit :{" "}
            <strong className="text-textDark">{t("freemiumUsed", { used: activeHabits.length, max: FREE_LIMITS.HABITS })}</strong>{" "}
            utilisées.{" "}
            <span className="text-accent font-semibold">{t("freemiumCta")}</span>{" "}
            {t("freemiumUpgrade")}
          </p>
        </div>
      )}

      {/* Bouton ajouter ou limite atteinte */}
      {canAddMore ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-2xl mb-6 transition flex items-center justify-center gap-2"
        >
          <span className="text-xl leading-none">+</span>
          {t("createBtn")}
        </button>
      ) : (
        <div className="w-full bg-accent/10 border border-accent/20 rounded-2xl mb-6 p-4 text-center">
          <p className="text-sm font-medium text-accent mb-1">{t("limitTitle", { max: FREE_LIMITS.HABITS })}</p>
          <p className="text-xs text-textLight">
            {t("limitSubtitle", { premium: "" }).split(t("limitUpgradeCta"))[0]}
            <span className="text-accent font-semibold">{t("limitUpgradeCta")}</span>
            {t("limitSubtitle", { premium: "" }).split(t("limitUpgradeCta"))[1]}
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
            <p className="text-textDark font-semibold mb-1">{t("emptyTitle")}</p>
            <p className="text-textLight text-sm">{t("emptySubtitle")}</p>
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

      {/* Suggestions */}
      <div className="mt-6">
        <p className="text-sm font-semibold text-textLight uppercase tracking-wide mb-3">{t("suggested.title")}</p>
        <div className="space-y-3">
          {suggestedHabits.map((s) => (
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
                <p className="text-xs text-textLight mt-0.5">{t("suggested.clickToCustomize")}</p>
              </div>
              <span className="text-xs text-primary font-semibold shrink-0">{t("suggested.addBtn")}</span>
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
            {t("archivedSection", { count: archivedHabits.length })}
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
