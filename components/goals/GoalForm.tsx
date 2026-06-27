"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const ICON_GROUPS_DATA = [
  { icons: ["💰", "💵", "💳", "🏦", "📈", "💎", "🪙", "💸"] },
  { icons: ["📚", "📖", "🎓", "📝", "🧠", "💡", "🔬", "🎯"] },
  { icons: ["🏃", "🚴", "🏊", "🏋️", "⚽", "🎾", "🧘", "🥊"] },
  { icons: ["✈️", "🌍", "🏖️", "🗺️", "🧳", "🏔️", "🚂", "⛵"] },
  { icons: ["💪", "🥗", "😴", "❤️", "🌿", "🧴", "🫶", "🌸"] },
  { icons: ["🎨", "🎵", "🎸", "📸", "✍️", "🎭", "🎬", "🎤"] },
  { icons: ["🏠", "🛋️", "🔨", "🌱", "🐕", "🛒", "🪴", "🧹"] },
  { icons: ["⭐", "🚀", "🏆", "🎪", "💫", "🔥", "✨", "🎉"] },
];

const COLORS = [
  "#5B5EA6", "#9B72CF", "#4CAF50", "#FF9800",
  "#EF4444", "#0EA5E9", "#EC4899", "#F97316",
  "#14B8A6", "#8B5CF6", "#FACC15", "#64748B",
];

export interface GoalFormData {
  title: string;
  icon: string;
  color: string;
  target: number;
  current: number;
  unit?: string;
  deadline?: string;
}

interface GoalFormProps {
  onSubmit: (data: GoalFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: GoalFormData & { id?: string };
  canAddMore: boolean;
  isPremium: boolean;
}

export function GoalForm({ onSubmit, onCancel, initialData, canAddMore, isPremium }: GoalFormProps) {
  const t = useTranslations("goals");

  const iconGroupLabels = t.raw("form.iconGroups") as Array<{ label: string }>;
  const ICON_GROUPS = ICON_GROUPS_DATA.map((g, i) => ({
    icons: g.icons,
    label: iconGroupLabels[i]?.label ?? String(i),
  }));

  const [title, setTitle]       = useState(initialData?.title ?? "");
  const [icon, setIcon]         = useState(initialData?.icon ?? "🎯");
  const [color, setColor]       = useState(initialData?.color ?? "#5B5EA6");
  const [target, setTarget]     = useState(initialData ? String(initialData.target) : "");
  const [current, setCurrent]   = useState(initialData ? String(initialData.current) : "0");
  const [unit, setUnit]         = useState(initialData?.unit ?? "");
  const [deadline, setDeadline] = useState(
    initialData?.deadline ? new Date(initialData.deadline).toISOString().slice(0, 10) : ""
  );
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const isEditing = !!initialData?.id;

  if (!isEditing && !canAddMore) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-card">
          <h2 className="text-lg font-semibold text-textDark mb-3">{t("form.limitTitle")}</h2>
          <p className="text-sm text-textLight mb-4">{t("form.limitText")}</p>
          {!isPremium && (
            <p className="text-xs bg-accent/10 text-accent rounded-xl p-3 mb-4">
              {t("form.limitPremiumBadge")}
            </p>
          )}
          <button onClick={onCancel} className="w-full py-3 rounded-xl border border-gray-200 text-sm font-medium text-textLight hover:bg-gray-50 transition">
            {t("form.close")}
          </button>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedTarget = parseFloat(target);
    const parsedCurrent = parseFloat(current);
    if (isNaN(parsedTarget) || parsedTarget <= 0) return;
    setLoading(true);
    await onSubmit({
      title: title.trim(),
      icon,
      color,
      target: parsedTarget,
      current: isNaN(parsedCurrent) ? 0 : parsedCurrent,
      unit: unit.trim() || undefined,
      deadline: deadline || undefined,
    });
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-card max-h-[90vh] overflow-y-auto">
        {/* Header avec preview */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ backgroundColor: `${color}25`, borderLeft: `4px solid ${color}` }}
          >
            {icon}
          </div>
          <h2 className="text-lg font-semibold text-textDark">
            {isEditing ? t("form.editTitle") : t("form.title")}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-textDark mb-1">{t("form.titleLabel")}</label>
            <input
              type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              required autoFocus placeholder={t("form.titlePlaceholder")}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          {/* Icône */}
          <div>
            <label className="block text-sm font-medium text-textDark mb-2">{t("form.iconLabel")}</label>
            <div className="space-y-1">
              {ICON_GROUPS.map((group) => (
                <div key={group.label} className="border border-gray-100 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenGroup(openGroup === group.label ? null : group.label)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-textDark hover:bg-gray-50 transition"
                  >
                    <span>{group.label}</span>
                    <span className="text-textLight">{openGroup === group.label ? "▲" : "▼"}</span>
                  </button>
                  {openGroup === group.label && (
                    <div className="grid grid-cols-8 gap-1 p-2 border-t border-gray-100 bg-gray-50">
                      {group.icons.map((ic) => (
                        <button
                          key={ic} type="button" onClick={() => setIcon(ic)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg text-lg transition ${
                            icon === ic ? "ring-2 ring-primary bg-white" : "hover:bg-white"
                          }`}
                        >
                          {ic}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Couleur */}
          <div>
            <label className="block text-sm font-medium text-textDark mb-2">{t("form.colorLabel")}</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c} type="button" onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition ${color === c ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : "hover:scale-105"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Cible & Actuel */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-textDark mb-1">{t("form.targetLabel")}</label>
              <input
                type="number" step="any" min="0.01" value={target}
                onChange={(e) => setTarget(e.target.value)} required placeholder={t("form.targetPlaceholder")}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textDark mb-1">{t("form.currentLabel")}</label>
              <input
                type="number" step="any" min="0" value={current}
                onChange={(e) => setCurrent(e.target.value)} placeholder="0"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>
          </div>

          {/* Unité */}
          <div>
            <label className="block text-sm font-medium text-textDark mb-1">
              {t("form.unitLabel")} <span className="text-textLight font-normal">({t("form.unitOptional")})</span>
            </label>
            <input
              type="text" value={unit} onChange={(e) => setUnit(e.target.value)}
              placeholder={t("form.unitPlaceholder")}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          {/* Échéance */}
          <div>
            <label className="block text-sm font-medium text-textDark mb-1">
              {t("form.deadlineLabel")} <span className="text-textLight font-normal">({t("form.deadlineOptional")})</span>
            </label>
            <input
              type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onCancel}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-textLight hover:bg-gray-50 transition">
              {t("form.cancel")}
            </button>
            <button type="submit" disabled={loading || !title.trim() || !target}
              className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-60 text-white text-sm font-semibold transition">
              {loading ? t("form.submitting") : isEditing ? t("form.submitEdit") : t("form.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
