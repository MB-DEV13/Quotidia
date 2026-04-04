"use client";

import { useState } from "react";

export const EXPENSE_CATEGORIES = [
  { value: "Alimentation",  label: "🛒 Alimentation" },
  { value: "Restaurant",    label: "🍽️ Restaurant" },
  { value: "Transport",     label: "🚗 Transport" },
  { value: "Carburant",     label: "⛽ Carburant" },
  { value: "Logement",      label: "🏠 Logement" },
  { value: "Charges",       label: "💡 Charges" },
  { value: "Santé",         label: "🏥 Santé" },
  { value: "Pharmacie",     label: "💊 Pharmacie" },
  { value: "Sport",         label: "🏋️ Sport" },
  { value: "Loisirs",       label: "🎮 Loisirs" },
  { value: "Voyages",       label: "✈️ Voyages" },
  { value: "Vêtements",     label: "👕 Vêtements" },
  { value: "Culture",       label: "🎬 Culture" },
  { value: "High-tech",     label: "💻 High-tech" },
  { value: "Abonnements",   label: "📱 Abonnements" },
  { value: "Beauté",        label: "💄 Beauté" },
  { value: "Épargne",       label: "🏦 Épargne" },
  { value: "Autres",        label: "📦 Autres" },
];

export const INCOME_CATEGORIES = [
  { value: "Salaire",       label: "💼 Salaire" },
  { value: "Emploi2",       label: "🏢 2ème emploi" },
  { value: "Freelance",     label: "💻 Freelance" },
  { value: "Vente",         label: "🛒 Vente" },
  { value: "Investissement",label: "📈 Investissement" },
  { value: "Bourse",        label: "📊 Bourse" },
  { value: "Location",      label: "🏘️ Location" },
  { value: "Allocation",    label: "🏛️ Allocation" },
  { value: "Jeux",          label: "🎰 Gains / Jeux" },
  { value: "Autre",         label: "💰 Autre revenu" },
];

export interface TransactionFormData {
  amount: number;
  category: string;
  label?: string;
  date?: string;
  isRecurring: boolean;
  recurrenceInterval?: "weekly" | "monthly" | "custom";
  recurrenceDays?: number;
}

interface TransactionFormInitialValues {
  amount: number;
  category: string;
  label?: string;
  date?: string;
  isRecurring?: boolean;
  recurrenceInterval?: "weekly" | "monthly" | "custom";
}

interface TransactionFormProps {
  type: "expense" | "income";
  onSubmit: (data: TransactionFormData) => Promise<void>;
  onCancel: () => void;
  initialValues?: TransactionFormInitialValues;
  editMode?: boolean;
}

const RECURRENCE_OPTIONS = [
  { value: "monthly", label: "Tous les mois" },
  { value: "weekly",  label: "Toutes les semaines" },
  { value: "custom",  label: "Personnalisé (X jours)" },
];

export function TransactionForm({ type, onSubmit, onCancel, initialValues, editMode = false }: TransactionFormProps) {
  const isExpense = type === "expense";
  const categories = isExpense ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const [amount, setAmount] = useState(initialValues?.amount?.toString() ?? "");
  const [category, setCategory] = useState(initialValues?.category ?? categories[0].value);
  const [label, setLabel] = useState(initialValues?.label ?? "");
  const [date, setDate] = useState(initialValues?.date ?? new Date().toISOString().slice(0, 10));
  const [isRecurring, setIsRecurring] = useState(initialValues?.isRecurring ?? false);
  const [recurrenceInterval, setRecurrenceInterval] = useState<"weekly" | "monthly" | "custom">(
    initialValues?.recurrenceInterval ?? "monthly"
  );
  const [recurrenceDays, setRecurrenceDays] = useState("30");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;
    setLoading(true);
    await onSubmit({
      amount: parsedAmount,
      category,
      label: label.trim() || undefined,
      date,
      isRecurring,
      recurrenceInterval: isRecurring ? recurrenceInterval : undefined,
      recurrenceDays: isRecurring && recurrenceInterval === "custom" ? parseInt(recurrenceDays) : undefined,
    });
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-card max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${isExpense ? "bg-danger/10" : "bg-success/10"}`}>
            {isExpense ? "💸" : "💵"}
          </div>
          <h2 className="text-lg font-semibold text-textDark">
            {editMode
              ? isExpense ? "Modifier la dépense" : "Modifier le revenu"
              : isExpense ? "Nouvelle dépense" : "Nouveau revenu"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Montant */}
          <div>
            <label className="block text-sm font-medium text-textDark mb-1">Montant (€)</label>
            <input
              type="number" step="0.01" min="0.01"
              value={amount} onChange={(e) => setAmount(e.target.value)}
              required autoFocus placeholder="ex: 12.50"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-textDark mb-2">Catégorie</label>
            <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
              {categories.map((cat) => (
                <button
                  key={cat.value} type="button" onClick={() => setCategory(cat.value)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-medium text-left transition ${
                    category === cat.value
                      ? isExpense ? "bg-danger/90 text-white" : "bg-success/90 text-white"
                      : "bg-gray-50 text-textDark hover:bg-gray-100"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-textDark mb-1">
              Description <span className="text-textLight font-normal">(optionnel)</span>
            </label>
            <input
              type="text" value={label} onChange={(e) => setLabel(e.target.value)}
              placeholder={isExpense ? "ex: Restaurant midi..." : "ex: Freelance mars..."}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-textDark mb-1">Date</label>
            <input
              type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          {/* Récurrent */}
          <div className="bg-gray-50 rounded-xl p-4">
            <button type="button" onClick={() => setIsRecurring((v) => !v)} className="w-full flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-textDark">Récurrent ?</p>
                <p className="text-xs text-textLight mt-0.5">
                  {isExpense ? "Loyer, abonnement, remboursement..." : "Salaire, revenu régulier..."}
                </p>
              </div>
              <div className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${isRecurring ? "bg-primary" : "bg-gray-300"}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${isRecurring ? "translate-x-5" : "translate-x-0"}`} />
              </div>
            </button>

            {isRecurring && (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {RECURRENCE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value} type="button"
                      onClick={() => setRecurrenceInterval(opt.value as "weekly" | "monthly" | "custom")}
                      className={`py-2 px-2 rounded-xl text-xs font-medium text-center transition ${
                        recurrenceInterval === opt.value ? "bg-primary text-white" : "bg-white border border-gray-200 text-textDark hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {recurrenceInterval === "custom" && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-textLight">Tous les</span>
                    <input
                      type="number" min="1" max="365" value={recurrenceDays}
                      onChange={(e) => setRecurrenceDays(e.target.value)}
                      className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <span className="text-sm text-textLight">jours</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onCancel}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-textLight hover:bg-gray-50 transition">
              Annuler
            </button>
            <button type="submit" disabled={loading || !amount || parseFloat(amount) <= 0}
              className={`flex-1 py-3 rounded-xl text-white text-sm font-semibold transition disabled:opacity-60 ${
                isExpense ? "bg-danger hover:bg-danger/90" : "bg-success hover:bg-success/90"
              }`}>
              {loading ? "Enregistrement..." : editMode ? "Enregistrer" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
