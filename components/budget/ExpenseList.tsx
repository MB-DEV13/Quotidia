"use client";

import { formatCurrency } from "@/lib/utils";
import { EXPENSE_CATEGORIES } from "./ExpenseForm";

export interface Expense {
  id: string;
  amount: number;
  category: string;
  label: string | null;
  date: string;
}

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

function getCategoryIcon(category: string): string {
  const found = EXPENSE_CATEGORIES.find((c) => c.value === category);
  return found ? found.label.split(" ")[0] : "📦";
}

function groupByDate(expenses: Expense[]): Map<string, Expense[]> {
  const map = new Map<string, Expense[]>();
  for (const expense of expenses) {
    const dateKey = new Date(expense.date).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    if (!map.has(dateKey)) map.set(dateKey, []);
    map.get(dateKey)!.push(expense);
  }
  return map;
}

export function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-soft p-8 text-center">
        <p className="text-3xl mb-2">💸</p>
        <p className="text-textLight text-sm">Aucune dépense ce mois.</p>
      </div>
    );
  }

  const grouped = groupByDate(expenses);

  return (
    <div className="space-y-4">
      {Array.from(grouped.entries()).map(([dateLabel, dayExpenses]) => (
        <div key={dateLabel}>
          <p className="text-xs font-semibold text-textLight uppercase tracking-wide mb-2 px-1">
            {dateLabel}
          </p>
          <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
            {dayExpenses.map((expense, idx) => (
              <div
                key={expense.id}
                className={`flex items-center justify-between px-4 py-3 ${
                  idx !== dayExpenses.length - 1 ? "border-b border-gray-50" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-base">
                    {getCategoryIcon(expense.category)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-textDark">
                      {expense.label || expense.category}
                    </p>
                    {expense.label && (
                      <p className="text-xs text-textLight">{expense.category}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-textDark text-sm">
                    -{formatCurrency(expense.amount)}
                  </span>
                  <button
                    onClick={() => onDelete(expense.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-textLight hover:bg-red-50 hover:text-danger transition text-sm"
                    aria-label="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
