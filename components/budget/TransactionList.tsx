"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "./TransactionForm";

export interface Transaction {
  id: string;
  type: "expense" | "income";
  amount: number;
  category: string;
  label: string | null;
  date: string;
  isRecurring: boolean;
  recurrenceInterval?: string | null;
  source?: string | null;
}

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string, type: "expense" | "income") => void;
  onEdit?: (transaction: Transaction) => void;
}

function getCategoryIcon(category: string, type: "expense" | "income"): string {
  const list = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const found = list.find((c) => c.value === category);
  return found ? found.label.split(" ")[0] : type === "expense" ? "📦" : "💰";
}

function getRecurrenceLabel(interval?: string | null): string {
  if (interval === "monthly") return "Mensuel";
  if (interval === "weekly") return "Hebdo";
  if (interval === "custom") return "Récurrent";
  return "Récurrent";
}

function groupByDate(transactions: Transaction[]): Map<string, Transaction[]> {
  const map = new Map<string, Transaction[]>();
  for (const t of transactions) {
    const dateKey = new Date(t.date).toLocaleDateString("fr-FR", {
      weekday: "long", day: "numeric", month: "long",
    });
    if (!map.has(dateKey)) map.set(dateKey, []);
    map.get(dateKey)!.push(t);
  }
  return map;
}

export function TransactionList({ transactions, onDelete, onEdit }: TransactionListProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-soft p-8 text-center">
        <p className="text-3xl mb-3">📊</p>
        <p className="text-textDark font-semibold mb-1">Aucune transaction ce mois</p>
        <p className="text-textLight text-sm">Utilise les boutons <strong>Dépense</strong> et <strong>Revenu</strong> ci-dessus pour commencer.</p>
      </div>
    );
  }

  const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const grouped = groupByDate(sorted);

  return (
    <div className="space-y-4">
      {Array.from(grouped.entries()).map(([dateLabel, dayTransactions]) => (
        <div key={dateLabel}>
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-xs font-semibold text-textLight uppercase tracking-wide capitalize">{dateLabel}</p>
            <p className={`text-xs font-semibold ${
              dayTransactions.reduce((sum, t) => sum + (t.type === "income" ? t.amount : -t.amount), 0) >= 0
                ? "text-success" : "text-danger"
            }`}>
              {formatCurrency(dayTransactions.reduce((sum, t) => sum + (t.type === "income" ? t.amount : -t.amount), 0))}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
            {dayTransactions.map((t, idx) => (
              <div
                key={t.id}
                className={`flex items-center justify-between px-4 py-3 ${
                  idx !== dayTransactions.length - 1 ? "border-b border-gray-50" : ""
                }`}
              >
                {/* Icône + infos */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${
                    t.type === "income" ? "bg-success/10" : "bg-danger/10"
                  }`}>
                    {getCategoryIcon(t.category, t.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-textDark truncate">
                        {t.label || t.category}
                      </p>
                      {t.source === "bank_sync" && (
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md font-medium shrink-0">
                          🏦 Banque
                        </span>
                      )}
                      {t.isRecurring && (
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-medium shrink-0">
                          🔁 {getRecurrenceLabel(t.recurrenceInterval)}
                        </span>
                      )}
                    </div>
                    {t.label && (
                      <p className="text-xs text-textLight">{t.category}</p>
                    )}
                  </div>
                </div>

                {/* Montant + actions */}
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <span className={`font-semibold text-sm ${t.type === "income" ? "text-success" : "text-danger"}`}>
                    {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                  </span>

                  {/* Confirmation suppression */}
                  {deleteConfirmId === t.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1 text-xs rounded-lg border border-gray-200 text-textLight hover:bg-gray-50 transition"
                      >
                        Non
                      </button>
                      <button
                        onClick={() => { onDelete(t.id, t.type); setDeleteConfirmId(null); }}
                        className="px-2 py-1 text-xs rounded-lg bg-danger text-white hover:bg-danger/90 transition font-medium"
                      >
                        Oui
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(t)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-textLight hover:bg-gray-100 hover:text-primary transition text-sm"
                          aria-label="Modifier"
                        >
                          ✏️
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteConfirmId(t.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-textLight hover:bg-red-50 hover:text-danger transition text-sm"
                        aria-label="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
