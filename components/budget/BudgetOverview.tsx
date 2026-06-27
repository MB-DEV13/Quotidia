"use client";

import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/utils";

interface CategorySummary {
  category: string;
  amount: number;
  percentage: number;
}

interface Top3Expense {
  label: string;
  amount: number;
  category: string;
}

interface BudgetOverviewProps {
  totalExpenses: number;
  totalIncome: number;
  budget: number;
  warningThreshold: number;
  byCategory: CategorySummary[];
  prevMonthExpenses?: number;
  top3?: Top3Expense[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Alimentation:   "#FF9800",
  Restaurant:     "#F97316",
  Transport:      "#5B5EA6",
  Carburant:      "#6366F1",
  Logement:       "#0EA5E9",
  Charges:        "#38BDF8",
  Santé:          "#4CAF50",
  Pharmacie:      "#22C55E",
  Sport:          "#84CC16",
  Loisirs:        "#9B72CF",
  Voyages:        "#EC4899",
  Vêtements:      "#F472B6",
  Culture:        "#8B5CF6",
  "High-tech":    "#3B82F6",
  Abonnements:    "#EF4444",
  Beauté:         "#FB7185",
  Épargne:        "#14B8A6",
  Autres:         "#888888",
};

export function BudgetOverview({ totalExpenses, totalIncome, budget, warningThreshold, byCategory, prevMonthExpenses, top3 }: BudgetOverviewProps) {
  const t = useTranslations("budget");

  const balance = totalIncome - totalExpenses;
  const effectiveBudget = budget > 0 ? budget : 0;
  const percentageUsed = effectiveBudget > 0 ? Math.min(Math.round((totalExpenses / effectiveBudget) * 100), 100) : 0;
  const isOverBudget = effectiveBudget > 0 && totalExpenses > effectiveBudget;
  const isNearWarning = !isOverBudget && warningThreshold > 0 && totalExpenses >= warningThreshold;

  const barColor = isOverBudget ? "bg-danger" : isNearWarning ? "bg-warning" : "bg-success";

  const diffPct = prevMonthExpenses && prevMonthExpenses > 0
    ? Math.round(((totalExpenses - prevMonthExpenses) / prevMonthExpenses) * 100)
    : null;

  return (
    <div className="bg-white rounded-2xl shadow-soft p-6">
      {/* Revenus / Dépenses / Solde */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="text-center">
          <p className="text-xs text-textLight mb-1">{t("overview.income")}</p>
          <p className="text-lg font-bold text-success">+{formatCurrency(totalIncome)}</p>
        </div>
        <div className="text-center border-x border-gray-100">
          <p className="text-xs text-textLight mb-1">{t("overview.expenses")}</p>
          <p className="text-lg font-bold text-danger">-{formatCurrency(totalExpenses)}</p>
          {diffPct !== null && (
            <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-1 ${
              diffPct > 0 ? "bg-danger/10 text-danger" : "bg-success/10 text-success"
            }`}>
              {diffPct > 0 ? "+" : ""}{t("overview.vsPrevMonth", { pct: diffPct })}
            </span>
          )}
        </div>
        <div className="text-center">
          <p className="text-xs text-textLight mb-1">{t("overview.balance")}</p>
          <p className={`text-lg font-bold ${balance >= 0 ? "text-success" : "text-danger"}`}>
            {balance >= 0 ? "+" : ""}{formatCurrency(balance)}
          </p>
        </div>
      </div>

      {/* Barre de progression budget */}
      {effectiveBudget > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-textLight">{t("overview.percentUsed", { percent: percentageUsed })}</span>
            <span className={`text-xs font-semibold ${isOverBudget ? "text-danger" : isNearWarning ? "text-warning" : "text-textLight"}`}>
              {isOverBudget
                ? t("overview.overBudget", { amount: formatCurrency(totalExpenses - effectiveBudget) })
                : isNearWarning
                  ? t("overview.warningReached", { amount: formatCurrency(effectiveBudget - totalExpenses) })
                  : t("overview.remaining", { amount: formatCurrency(effectiveBudget - totalExpenses) })}
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all ${barColor}`}
              style={{ width: `${percentageUsed}%` }}
            />
            {warningThreshold > 0 && warningThreshold < effectiveBudget && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-warning/70"
                style={{ left: `${Math.round((warningThreshold / effectiveBudget) * 100)}%` }}
              />
            )}
          </div>
          <div className="flex justify-between mt-1">
            <p className="text-xs text-textLight">{t("overview.ceiling", { amount: formatCurrency(effectiveBudget) })}</p>
            {warningThreshold > 0 && (
              <p className="text-xs text-warning">{t("overview.warningThreshold", { amount: formatCurrency(warningThreshold) })}</p>
            )}
          </div>
        </div>
      )}

      {/* Top 3 dépenses */}
      {top3 && top3.length > 0 && (
        <div className="mb-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-textLight uppercase tracking-wide mb-2">{t("overview.topExpenses")}</p>
          <div className="space-y-2">
            {top3.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-textLight w-4">{i + 1}.</span>
                  <span className="text-sm text-textDark">{item.label || item.category}</span>
                  {item.label && <span className="text-xs text-textLight">({item.category})</span>}
                </div>
                <span className="text-sm font-semibold text-danger">-{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Répartition par catégorie */}
      {byCategory.length > 0 && (
        <div className="space-y-2.5 pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-textLight uppercase tracking-wide">{t("overview.byCategory")}</p>
          {byCategory.map((cat) => (
            <div key={cat.category}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-textDark">{cat.category}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-textLight">{cat.percentage}%</span>
                  <span className="text-xs font-medium text-textDark">{formatCurrency(cat.amount)}</span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${cat.percentage}%`, backgroundColor: CATEGORY_COLORS[cat.category] ?? "#888888" }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
