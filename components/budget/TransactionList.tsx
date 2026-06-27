"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
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

function groupByDate(transactions: Transaction[], locale: string): Map<string, Transaction[]> {
  const map = new Map<string, Transaction[]>();
  for (const t of transactions) {
    const dateKey = new Date(t.date).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
      weekday: "long", day: "numeric", month: "long",
    });
    if (!map.has(dateKey)) map.set(dateKey, []);
    map.get(dateKey)!.push(t);
  }
  return map;
}

export function TransactionList({ transactions, onDelete, onEdit }: TransactionListProps) {
  const t = useTranslations("budget");
  const locale = useLocale();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  function getRecurrenceLabel(interval?: string | null): string {
    if (interval === "monthly") return t("transaction.recurrence.monthly");
    if (interval === "weekly") return t("transaction.recurrence.weekly");
    return t("transaction.recurrence.custom");
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-soft p-8 text-center">
        <p className="text-3xl mb-3">📊</p>
        <p className="text-textDark font-semibold mb-1">{t("transaction.empty")}</p>
        <p className="text-textLight text-sm">{t("transaction.emptyHint")}</p>
      </div>
    );
  }

  const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const grouped = groupByDate(sorted, locale);

  return (
    <div className="space-y-4">
      {Array.from(grouped.entries()).map(([dateLabel, dayTransactions]) => (
        <div key={dateLabel}>
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-xs font-semibold text-textLight uppercase tracking-wide capitalize">{dateLabel}</p>
            <p className={`text-xs font-semibold ${
              dayTransactions.reduce((sum, tx) => sum + (tx.type === "income" ? tx.amount : -tx.amount), 0) >= 0
                ? "text-success" : "text-danger"
            }`}>
              {formatCurrency(dayTransactions.reduce((sum, tx) => sum + (tx.type === "income" ? tx.amount : -tx.amount), 0))}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
            {dayTransactions.map((tx, idx) => (
              <div
                key={tx.id}
                className={`flex items-center justify-between px-4 py-3 ${
                  idx !== dayTransactions.length - 1 ? "border-b border-gray-50" : ""
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${
                    tx.type === "income" ? "bg-success/10" : "bg-danger/10"
                  }`}>
                    {getCategoryIcon(tx.category, tx.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-textDark truncate">
                        {tx.label || tx.category}
                      </p>
                      {tx.source === "bank_sync" && (
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md font-medium shrink-0">
                          🏦 {t("transaction.bankSource")}
                        </span>
                      )}
                      {tx.isRecurring && (
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-medium shrink-0">
                          🔁 {getRecurrenceLabel(tx.recurrenceInterval)}
                        </span>
                      )}
                    </div>
                    {tx.label && (
                      <p className="text-xs text-textLight">{tx.category}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <span className={`font-semibold text-sm ${tx.type === "income" ? "text-success" : "text-danger"}`}>
                    {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                  </span>

                  {deleteConfirmId === tx.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1 text-xs rounded-lg border border-gray-200 text-textLight hover:bg-gray-50 transition"
                      >
                        {t("transaction.confirmNo")}
                      </button>
                      <button
                        onClick={() => { onDelete(tx.id, tx.type); setDeleteConfirmId(null); }}
                        className="px-2 py-1 text-xs rounded-lg bg-danger text-white hover:bg-danger/90 transition font-medium"
                      >
                        {t("transaction.confirmYes")}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(tx)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-textLight hover:bg-gray-100 hover:text-primary transition text-sm"
                          aria-label={t("transaction.editLabel")}
                        >
                          ✏️
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteConfirmId(tx.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-textLight hover:bg-red-50 hover:text-danger transition text-sm"
                        aria-label={t("transaction.deleteLabel")}
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
