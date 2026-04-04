"use client";

import { useState } from "react";

const COLORS = [
  "#5B5EA6", "#9B72CF", "#4CAF50", "#FF9800",
  "#EF4444", "#0EA5E9", "#EC4899", "#14B8A6",
];

const ICON_GROUPS = [
  { id: "sport",       label: "🏃 Sport",        icons: ["🏃", "🚴", "🏊", "🏋️", "⚽", "🎾", "🥊", "🏀", "🧗", "🤸", "🎿", "🏄"] },
  { id: "wellness",    label: "🧘 Bien-être",     icons: ["🧘", "😴", "💆", "🌿", "💊", "🩺", "❤️", "💪", "🫁", "🌬️"] },
  { id: "knowledge",   label: "📚 Savoir",        icons: ["📚", "✍️", "🎓", "💻", "🔬", "📖", "🗣️", "🧠", "🌐", "🔭"] },
  { id: "nutrition",   label: "🍏 Nutrition",     icons: ["🥗", "💧", "🍎", "🥦", "🍵", "🫖", "🥤", "🍳", "🥑", "🫐"] },
  { id: "productivity",label: "💼 Productivité",  icons: ["💼", "🎯", "✅", "📋", "⏰", "📊", "📝", "🔧", "📱", "💡"] },
  { id: "creativity",  label: "🎨 Créativité",    icons: ["🎵", "🎨", "📸", "🎬", "✏️", "🎭", "🎸", "🎹", "🖌️", "🎤"] },
  { id: "lifestyle",   label: "🌟 Lifestyle",     icons: ["🌙", "☀️", "🌱", "💰", "🏠", "🤝", "🐕", "🌍", "🧹", "💝"] },
];

const WEEK_DAYS = [
  { iso: 1, label: "Lun" }, { iso: 2, label: "Mar" }, { iso: 3, label: "Mer" },
  { iso: 4, label: "Jeu" }, { iso: 5, label: "Ven" }, { iso: 6, label: "Sam" }, { iso: 7, label: "Dim" },
];

type FrequencyMode = "daily" | "days" | "once";

function parseFrequency(freq: string): { freqMode: FrequencyMode; selectedDays: number[]; onceDate: string } {
  if (freq.startsWith("days:")) {
    const days = freq.slice(5).split(",").filter(Boolean).map(Number);
    return { freqMode: "days", selectedDays: days, onceDate: "" };
  }
  if (freq.startsWith("once:")) {
    return { freqMode: "once", selectedDays: [], onceDate: freq.slice(5) };
  }
  return { freqMode: "daily", selectedDays: [], onceDate: "" };
}

interface HabitFormProps {
  onSubmit: (data: { name: string; icon?: string; color: string; frequency: string }) => void;
  onCancel: () => void;
  initialValues?: { name: string; icon: string; color: string; frequency: string };
  editMode?: boolean;
}

export function HabitForm({ onSubmit, onCancel, initialValues, editMode = false }: HabitFormProps) {
  const parsed = initialValues ? parseFrequency(initialValues.frequency) : { freqMode: "daily" as FrequencyMode, selectedDays: [], onceDate: "" };

  const [name, setName] = useState(initialValues?.name ?? "");
  const [icon, setIcon] = useState(initialValues?.icon ?? "✅");
  const [color, setColor] = useState(initialValues?.color ?? "#5B5EA6");
  const [freqMode, setFreqMode] = useState<FrequencyMode>(parsed.freqMode);
  const [selectedDays, setSelectedDays] = useState<number[]>(parsed.selectedDays);
  const [onceDate, setOnceDate] = useState(parsed.onceDate);
  const [loading, setLoading] = useState(false);
  const [openGroup, setOpenGroup] = useState<string>(() => {
    if (!initialValues?.icon) return "sport";
    return ICON_GROUPS.find((g) => g.icons.includes(initialValues.icon))?.id ?? "sport";
  });

  function buildFrequency(): string {
    if (freqMode === "daily") return "daily";
    if (freqMode === "days") return `days:${selectedDays.sort().join(",")}`;
    return `once:${onceDate}`;
  }

  function isValid(): boolean {
    if (!name.trim()) return false;
    if (freqMode === "days" && selectedDays.length === 0) return false;
    if (freqMode === "once" && !onceDate) return false;
    return true;
  }

  function toggleDay(iso: number) {
    setSelectedDays((prev) => prev.includes(iso) ? prev.filter((d) => d !== iso) : [...prev, iso]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid()) return;
    setLoading(true);
    await onSubmit({ name: name.trim(), icon, color, frequency: buildFrequency() });
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-card max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ backgroundColor: `${color}25`, borderLeft: `4px solid ${color}` }}
          >
            {icon}
          </div>
          <h2 className="text-lg font-semibold text-textDark">
            {editMode ? "Modifier l'habitude" : "Nouvelle habitude"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-textDark mb-1">Nom</label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              required autoFocus
              placeholder="ex: Méditation, Sport, Lecture..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          {/* Icône — accordéon par catégorie */}
          <div>
            <label className="block text-sm font-medium text-textDark mb-2">Icône</label>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              {ICON_GROUPS.map((group, i) => (
                <div key={group.id} className={i > 0 ? "border-t border-gray-100" : ""}>
                  <button
                    type="button"
                    onClick={() => setOpenGroup(openGroup === group.id ? "" : group.id)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-textDark hover:bg-gray-50 transition"
                  >
                    <span className="font-medium">{group.label}</span>
                    <span className="text-textLight text-xs">{openGroup === group.id ? "▾" : "▸"}</span>
                  </button>
                  {openGroup === group.id && (
                    <div className="px-4 pb-3 flex flex-wrap gap-2">
                      {group.icons.map((ic) => (
                        <button
                          key={ic} type="button" onClick={() => setIcon(ic)}
                          className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition ${
                            icon === ic ? "ring-2 ring-primary bg-primary/10" : "bg-gray-50 hover:bg-gray-100"
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
            <label className="block text-sm font-medium text-textDark mb-2">Couleur</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c} type="button" onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition ${color === c ? "ring-2 ring-offset-2 ring-gray-400" : ""}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            </div>

          {/* Récurrence */}
          <div>
            <label className="block text-sm font-medium text-textDark mb-2">Récurrence</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {([
                { key: "daily", label: "Tous les jours", icon: "🔁" },
                { key: "days",  label: "Jours précis",   icon: "📅" },
                { key: "once",  label: "Date unique",    icon: "📌" },
              ] as { key: FrequencyMode; label: string; icon: string }[]).map((opt) => (
                <button
                  key={opt.key} type="button" onClick={() => setFreqMode(opt.key)}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-medium transition ${
                    freqMode === opt.key ? "bg-primary text-white" : "bg-gray-100 text-textLight hover:bg-gray-200"
                  }`}
                >
                  <span className="text-base">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>

            {freqMode === "days" && (
              <div>
                <p className="text-xs text-textLight mb-2">Sélectionne les jours :</p>
                <div className="flex gap-1.5">
                  {WEEK_DAYS.map((day) => (
                    <button
                      key={day.iso} type="button" onClick={() => toggleDay(day.iso)}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                        selectedDays.includes(day.iso) ? "bg-primary text-white" : "bg-gray-100 text-textLight hover:bg-gray-200"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
                {selectedDays.length === 0 && (
                  <p className="text-xs text-danger mt-1">Sélectionne au moins un jour.</p>
                )}
              </div>
            )}

            {freqMode === "once" && (
              <div>
                <p className="text-xs text-textLight mb-2">Choisir la date :</p>
                <input
                  type="date" value={onceDate} onChange={(e) => setOnceDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button" onClick={onCancel}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-textLight hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit" disabled={loading || !isValid()}
              className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-60 text-white text-sm font-semibold transition"
            >
              {loading ? "Enregistrement..." : editMode ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
