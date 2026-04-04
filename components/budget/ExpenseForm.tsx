"use client";

import { useState } from "react";

export const EXPENSE_CATEGORIES = [
  { value: "Alimentation", label: "🍕 Alimentation" },
  { value: "Transport", label: "🚗 Transport" },
  { value: "Loisirs", label: "🎮 Loisirs" },
  { value: "Logement", label: "🏠 Logement" },
  { value: "Santé", label: "🏥 Santé" },
  { value: "Abonnements", label: "📱 Abonnements" },
  { value: "Autres", label: "📦 Autres" },
];

interface Expense {
  id: string;
  amount: number;
  category: string;
  label: string | null;
  date: string;
}

interface ExpenseFormProps {
  onSubmit: (data: { amount: number; category: string; label?: string; date?: string }) => Promise<void>;
  onCancel: () => void;
  initialData?: Expense;
}

export function ExpenseForm({ onSubmit, onCancel, initialData }: ExpenseFormProps) {
  const [amount, setAmount] = useState(initialData ? String(initialData.amount) : "");
  const [category, setCategory] = useState(initialData?.category ?? "Alimentation");
  const [label, setLabel] = useState(initialData?.label ?? "");
  const [date, setDate] = useState(
    initialData?.date
      ? new Date(initialData.date).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  );
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
    });
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-card max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-textDark mb-5">
          {initialData ? "Modifier la dépense" : "Nouvelle dépense"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-textDark mb-1">Montant (€)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              autoFocus
              placeholder="ex: 12.50"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-textDark mb-2">Catégorie</label>
            <div className="grid grid-cols-2 gap-2">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-medium text-left transition ${
                    category === cat.value
                      ? "bg-primary text-white"
                      : "bg-gray-50 text-textDark hover:bg-gray-100"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-textDark mb-1">
              Description <span className="text-textLight font-normal">(optionnel)</span>
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="ex: Restaurant midi, Métro..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-textDark mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-textLight hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-60 text-white text-sm font-semibold transition"
            >
              {loading ? "Enregistrement..." : initialData ? "Modifier" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
