"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GoalCard, type Goal } from "./GoalCard";
import { GoalForm, type GoalFormData } from "./GoalForm";

const TIPS = [
  { icon: "🎯", text: "Décompose chaque grand objectif en petites étapes. Chaque progrès compte, même minime." },
  { icon: "📅", text: "Fixe une échéance réaliste. Un objectif sans date reste un rêve." },
  { icon: "📈", text: "Mesure ta progression régulièrement. Ce qui se mesure s'améliore." },
  { icon: "🔁", text: "La constance bat l'intensité. Avancer un peu chaque jour surpasse un grand effort ponctuel." },
  { icon: "🏆", text: "Célèbre chaque étape franchie. La motivation se nourrit de petites victoires." },
  { icon: "💡", text: "Partage tes objectifs avec quelqu'un de confiance. L'engagement social booste la réussite." },
];

const SUGGESTED_GOALS = [
  { title: "Épargner 1 000 €",   icon: "💰", color: "#4CAF50", target: 1000, unit: "€" },
  { title: "Lire 12 livres",      icon: "📚", color: "#5B5EA6", target: 12,   unit: "livres" },
  { title: "Courir 100 km",       icon: "🏃", color: "#F97316", target: 100,  unit: "km" },
  { title: "Perdre 5 kg",         icon: "⚖️", color: "#0EA5E9", target: 5,    unit: "kg" },
  { title: "Faire 50 séances",    icon: "🏋️", color: "#EF4444", target: 50,   unit: "séances" },
  { title: "Économiser 3 000 €",  icon: "🏦", color: "#14B8A6", target: 3000, unit: "€" },
  { title: "Apprendre une langue",icon: "🎓", color: "#9B72CF", target: 100,  unit: "leçons" },
  { title: "Voyager dans 3 pays", icon: "✈️", color: "#EC4899", target: 3,    unit: "pays" },
];

interface GoalsClientProps {
  initialGoals: Goal[];
  canAddMore: boolean;
  isPremium: boolean;
}

export function GoalsClient({ initialGoals, canAddMore, isPremium }: GoalsClientProps) {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>(initialGoals);

  // Sync depuis le serveur après chaque router.refresh()
  useEffect(() => { setGoals(initialGoals); }, [initialGoals]);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [prefillData, setPrefillData] = useState<Partial<GoalFormData> | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);

  const activeGoals = goals.filter((g) => g.current < g.target);
  const completedGoals = goals.filter((g) => g.current >= g.target);

  // Bilan global
  const globalPct = useMemo(() => {
    if (goals.length === 0) return 0;
    const avg = goals.reduce((sum, g) => sum + Math.min(g.current / g.target, 1), 0) / goals.length;
    return Math.round(avg * 100);
  }, [goals]);

  const nextGoal = useMemo(() => {
    return activeGoals
      .filter((g) => g.deadline)
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())[0] ?? null;
  }, [activeGoals]);

  // Conseil du jour basé sur le jour de la semaine (stable, pas de random au render)
  const tip = TIPS[new Date().getDay() % TIPS.length];

  async function handleCreate(data: GoalFormData) {
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setShowForm(false);
      setPrefillData(null);
      router.refresh();
    }
  }

  async function handleUpdate(id: string, current: number): Promise<{ justCompleted: boolean }> {
    const goal = goals.find((g) => g.id === id);
    const wasCompleted = goal ? goal.current >= goal.target : false;

    const res = await fetch(`/api/goals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current }),
    });

    if (res.ok) {
      const json = await res.json();
      const updated = json.data;
      const isNowCompleted = updated.current >= updated.target;
      router.refresh();
      return { justCompleted: !wasCompleted && isNowCompleted };
    }
    return { justCompleted: false };
  }

  async function handleEdit(data: GoalFormData) {
    if (!editingGoal) return;
    const res = await fetch(`/api/goals/${editingGoal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setEditingGoal(null);
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
    if (res.ok) { router.refresh(); }
  }

  async function handleRestart(id: string) {
    const res = await fetch(`/api/goals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current: 0 }),
    });
    if (res.ok) { router.refresh(); }
  }

  function openSuggestion(s: typeof SUGGESTED_GOALS[number]) {
    setPrefillData({ title: s.title, icon: s.icon, color: s.color, target: s.target, unit: s.unit, current: 0 });
    setShowForm(true);
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-textDark">Objectifs</h1>
        <p className="text-textLight text-sm mt-1">Suis ta progression vers tes objectifs</p>
        {!isPremium && (
          <div className="mt-3 bg-accent/5 border border-accent/20 rounded-2xl px-4 py-3 text-center">
            <p className="text-xs text-textLight">
              Compte gratuit :{" "}
              <strong className="text-textDark">{goals.length}/2 objectifs</strong> utilisés.{" "}
              <span className="text-accent font-semibold">Premium</span> pour des objectifs illimités.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <GoalForm
          onSubmit={handleCreate}
          onCancel={() => { setShowForm(false); setPrefillData(null); }}
          initialData={prefillData ? {
            title: prefillData.title ?? "",
            icon: prefillData.icon ?? "🎯",
            color: prefillData.color ?? "#5B5EA6",
            target: prefillData.target ?? 0,
            current: prefillData.current ?? 0,
            unit: prefillData.unit,
          } : undefined}
          canAddMore={canAddMore}
          isPremium={isPremium}
        />
      )}

      {editingGoal && (
        <GoalForm
          onSubmit={handleEdit}
          onCancel={() => setEditingGoal(null)}
          initialData={{
            id: editingGoal.id,
            title: editingGoal.title,
            icon: editingGoal.icon,
            color: editingGoal.color,
            target: editingGoal.target,
            current: editingGoal.current,
            unit: editingGoal.unit ?? undefined,
            deadline: editingGoal.deadline ?? undefined,
          }}
          canAddMore={true}
          isPremium={isPremium}
        />
      )}

      {/* Bouton créer */}
      <button
        onClick={() => setShowForm(true)}
        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-2xl mb-6 transition flex items-center justify-center gap-2"
      >
        <span className="text-xl leading-none">+</span>
        Nouvel objectif
      </button>

      {/* Objectifs actifs */}
      {activeGoals.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-textLight uppercase tracking-wide mb-3">
                En cours ({activeGoals.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    onEdit={setEditingGoal}
                  />
                ))}
              </div>
            </div>
          )}

          {completedGoals.length > 0 && (
            <div>
              <button
                onClick={() => setArchiveOpen((v) => !v)}
                className="w-full flex items-center justify-between bg-white rounded-2xl shadow-soft px-5 py-3.5 hover:shadow-card transition"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏆</span>
                  <span className="text-sm font-semibold text-textDark">
                    {completedGoals.length} objectif{completedGoals.length > 1 ? "s" : ""} complété{completedGoals.length > 1 ? "s" : ""}
                  </span>
                </div>
                <span className="text-textLight text-sm transition-transform duration-200" style={{ display: "inline-block", transform: archiveOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                  ▾
                </span>
              </button>

              {archiveOpen && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {completedGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                      onEdit={setEditingGoal}
                      onRestart={handleRestart}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

      {/* Suggestions — toujours affichées */}
      {goals.length === 0 && (
        <div className="bg-white rounded-2xl shadow-soft p-8 text-center mb-5 mt-2">
          <p className="text-4xl mb-3">🎯</p>
          <h2 className="text-base font-bold text-textDark mb-1">Aucun objectif pour l'instant</h2>
          <p className="text-sm text-textLight">Crée ton premier objectif et commence à progresser !</p>
        </div>
      )}
      {completedGoals.length > 0 && activeGoals.length === 0 && (
        <div className="bg-success/10 border border-success/20 rounded-2xl p-5 text-center mt-4 mb-2">
          <p className="text-3xl mb-2">🎉</p>
          <p className="text-sm font-bold text-success">Tous tes objectifs sont atteints !</p>
          <p className="text-xs text-textLight mt-1">Prêt pour de nouveaux défis ?</p>
        </div>
      )}
      <div className="mt-6 mb-6">
        <p className="text-sm font-semibold text-textLight uppercase tracking-wide mb-3">Suggestions populaires</p>
        <div className="grid grid-cols-2 gap-3">
          {SUGGESTED_GOALS.map((s) => (
            <button
              key={s.title}
              onClick={() => openSuggestion(s)}
              className="bg-white rounded-2xl shadow-soft p-4 text-left hover:shadow-card transition border border-transparent hover:border-primary/20"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-2"
                style={{ backgroundColor: `${s.color}20` }}
              >
                {s.icon}
              </div>
              <p className="text-xs font-semibold text-textDark leading-tight">{s.title}</p>
              <p className="text-[10px] text-textLight mt-0.5">{s.target} {s.unit}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Bilan global — affiché seulement si au moins 1 objectif */}
      {goals.length > 0 && (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl shadow-soft p-4 text-center">
            <p className="text-2xl font-bold text-primary">{activeGoals.length}</p>
            <p className="text-xs text-textLight mt-1">En cours</p>
          </div>
          <div className="bg-white rounded-2xl shadow-soft p-4 text-center">
            <p className="text-2xl font-bold text-success">{completedGoals.length}</p>
            <p className="text-xs text-textLight mt-1">Complétés</p>
          </div>
          <div className="bg-white rounded-2xl shadow-soft p-4 text-center">
            <p className="text-2xl font-bold text-accent">{globalPct}%</p>
            <p className="text-xs text-textLight mt-1">Progression globale</p>
          </div>
          <div className="bg-white rounded-2xl shadow-soft p-4 text-center">
            {nextGoal ? (
              <>
                <p className="text-sm font-bold text-textDark truncate">{nextGoal.icon} {nextGoal.title}</p>
                <p className="text-xs text-textLight mt-1">Prochain à terminer</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-textLight">—</p>
                <p className="text-xs text-textLight mt-1">Prochain à terminer</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Conseil du jour */}
      <div className="mt-5 bg-white rounded-2xl shadow-soft p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-lg shrink-0">
          {tip.icon}
        </div>
        <div>
          <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-1">Conseil du jour</p>
          <p className="text-sm text-textDark">{tip.text}</p>
        </div>
      </div>
    </div>
  );
}
