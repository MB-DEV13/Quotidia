"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { BudgetOverview } from "./BudgetOverview";
import { BudgetSetupModal } from "./BudgetSetupModal";
import { TransactionForm, type TransactionFormData } from "./TransactionForm";
import { TransactionList, type Transaction } from "./TransactionList";
import { CategoryPie } from "@/components/charts/CategoryPie";
import { MonthlyChart } from "@/components/charts/MonthlyChart";
import { BankConnectionModal } from "./BankConnectionModal";
import { BankConnectionBanner } from "./BankConnectionBanner";
import { BankConnectionStatus } from "./BankConnectionStatus";

interface CategorySummary {
  category: string;
  amount: number;
  percentage: number;
}

interface WeekData {
  week: string;
  amount: number;
}

interface BudgetConfig {
  monthlyBudget: number;
  incomeAmount: number;
  incomePeriod: number;
  incomeLabel: string | null;
  configured: boolean;
}

interface BankConnectionData {
  status: string;
  bankName: string | null;
  bankLogoUrl: string | null;
  lastSyncAt: string | null;
}

interface BudgetClientProps {
  initialTransactions: Transaction[];
  initialSummary: {
    totalExpenses: number;
    totalIncome: number;
    budget: number;
    warningThreshold: number;
    byCategory: CategorySummary[];
  };
  weeklyData: WeekData[];
  currentMonth: string;
  budgetConfig: BudgetConfig | null;
  isPremium: boolean;
  prevMonthExpenses?: number;
  budgetMode?: string;
  bankConnection?: BankConnectionData | null;
  bridgeStatus?: string | null; // "success" | "error" | null
}

export function BudgetClient({
  initialTransactions,
  initialSummary,
  weeklyData,
  currentMonth,
  budgetConfig: initialConfig,
  isPremium,
  prevMonthExpenses,
  budgetMode = "manual",
  bankConnection,
  bridgeStatus,
}: BudgetClientProps) {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [summary, setSummary] = useState(initialSummary);

  // Sync depuis le serveur après chaque router.refresh()
  useEffect(() => { setTransactions(initialTransactions); }, [initialTransactions]);
  useEffect(() => { setSummary(initialSummary); }, [initialSummary]);
  const [showForm, setShowForm] = useState<"expense" | "income" | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showSetup, setShowSetup] = useState(!initialConfig?.configured);
  const [month, setMonth] = useState(currentMonth);

  // Modal Bridge : afficher si Premium + pas encore de banque connectée + pas déjà refusé
  const [showBankModal, setShowBankModal] = useState(() => {
    if (!isPremium) return false;
    if (bankConnection?.status === "active") return false;
    if (bridgeStatus === "error") return false;
    if (typeof window === "undefined") return false;
    return localStorage.getItem("quotidia_bridge_modal_dismissed") !== "true";
  });
  const [activeTab, setActiveTab] = useState<"all" | "expense" | "income">("all");
  const [formError, setFormError] = useState<string | null>(null);

  const navigateMonth = useCallback(
    (direction: -1 | 1) => {
      const [year, mon] = month.split("-").map(Number);
      const d = new Date(year, mon - 1 + direction, 1);
      const newMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      setMonth(newMonth);
      router.push(`/budget?month=${newMonth}`);
    },
    [month, router]
  );

  async function handleSetupComplete(config: {
    monthlyBudget: number;
    incomeAmount: number;
    incomePeriod: number;
    incomeLabel: string;
  }) {
    await fetch("/api/budget/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...config, configured: true }),
    });
    setShowSetup(false);
    router.refresh();
  }

  async function handleCreate(data: TransactionFormData) {
    const isExpense = showForm === "expense";
    const endpoint = isExpense ? "/api/budget" : "/api/income";
    setFormError(null);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok) {
      if (res.status === 403 && json.limitReached) {
        setShowForm(null);
      } else {
        setFormError(json.error ?? "Une erreur est survenue.");
      }
      return;
    }

    setShowForm(null);
    setFormError(null);
    router.refresh();
  }

  async function handleEdit(data: TransactionFormData) {
    if (!editingTransaction) return;
    const endpoint = editingTransaction.type === "expense"
      ? `/api/budget/${editingTransaction.id}`
      : `/api/income/${editingTransaction.id}`;
    const res = await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setEditingTransaction(null);
      router.refresh();
    }
  }

  async function handleDelete(id: string, type: "expense" | "income") {
    const endpoint = type === "expense" ? `/api/budget/${id}` : `/api/income/${id}`;
    const res = await fetch(endpoint, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    }
  }

  const [yearStr, monStr] = month.split("-");
  const monthLabel = new Date(parseInt(yearStr), parseInt(monStr) - 1, 1).toLocaleDateString(
    "fr-FR",
    { month: "long", year: "numeric" }
  );

  const filteredTransactions = transactions.filter((t) =>
    activeTab === "all" ? true : t.type === activeTab
  );

  const expenseTransactions = transactions.filter((t) => t.type === "expense");

  // Top 3 dépenses par montant
  const top3 = [...expenseTransactions]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3)
    .map((t) => ({ label: t.label ?? "", amount: t.amount, category: t.category }));

  // Seuils budget
  const effectiveBudget = summary.budget > 0 ? summary.budget : 0;
  const isOverBudget = effectiveBudget > 0 && summary.totalExpenses > effectiveBudget;
  const isNearWarning = !isOverBudget && summary.warningThreshold > 0 && summary.totalExpenses >= summary.warningThreshold;

  // Catégories utilisées ce mois (mois affiché)
  const usedCategoriesThisMonth = new Set(
    expenseTransactions.filter((t) => {
      const d = new Date(t.date);
      const [y, m] = month.split("-").map(Number);
      return d.getFullYear() === y && d.getMonth() + 1 === m;
    }).map((t) => t.category)
  ).size;

  return (
    <div>
      {/* Modal Bridge (Premium sans banque connectée) */}
      {showBankModal && (
        <BankConnectionModal onDismiss={() => setShowBankModal(false)} />
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-textDark">Budget</h1>
        <p className="text-textLight text-sm mt-1">Revenus & dépenses</p>
        {!isPremium && (
          <div className="mt-3 bg-accent/5 border border-accent/20 rounded-2xl px-4 py-3 text-center">
            <p className="text-xs text-textLight">
              Compte gratuit :{" "}
              <strong className="text-textDark">{usedCategoriesThisMonth}/2 catégories</strong> utilisées ce mois.{" "}
              <span className="text-accent font-semibold">Premium</span> pour des catégories illimitées.
            </p>
          </div>
        )}
      </div>

      {/* Bandeau Bridge — non-abonnés */}
      {!isPremium && <BankConnectionBanner />}

      {/* Statut connexion bancaire — abonnés avec banque connectée */}
      {isPremium && bankConnection?.status === "active" && budgetMode === "automatic" && (
        <BankConnectionStatus
          bankName={bankConnection.bankName}
          lastSyncAt={bankConnection.lastSyncAt ? new Date(bankConnection.lastSyncAt) : null}
          status={bankConnection.status}
        />
      )}

      {/* Alerte Bridge success/error */}
      {bridgeStatus === "success" && (
        <div className="mb-6 bg-green-50 border border-green-100 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-xl">✅</span>
          <p className="text-sm text-green-700 font-medium">Banque connectée ! Tes transactions ont été importées.</p>
        </div>
      )}
      {bridgeStatus === "error" && (
        <div className="mb-6 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <p className="text-sm text-red-700 font-medium">La connexion bancaire a échoué. Réessaie depuis les paramètres.</p>
        </div>
      )}

      {showSetup && (
        <BudgetSetupModal isOpen={showSetup} onComplete={handleSetupComplete} />
      )}

      {/* Alerte rouge — plafond dépassé */}
      {isOverBudget && (
        <div className="mb-6 bg-danger/10 border border-danger/30 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">🚨</span>
          <div>
            <p className="text-sm font-semibold text-danger">Budget dépassé !</p>
            <p className="text-xs text-danger/80">
              Tu as dépassé ton revenu de <strong>{formatCurrency(summary.totalExpenses - effectiveBudget)}</strong> ce mois.
            </p>
          </div>
        </div>
      )}

      {/* Alerte orange — seuil d'alerte atteint */}
      {isNearWarning && (
        <div className="mb-6 bg-warning/10 border border-warning/30 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-warning">Seuil d&apos;alerte atteint</p>
            <p className="text-xs text-warning/80">
              Tu as dépensé {formatCurrency(summary.totalExpenses)} sur ton seuil de {formatCurrency(summary.warningThreshold)}.{" "}
              Il te reste {formatCurrency(effectiveBudget - summary.totalExpenses)} avant le plafond.
            </p>
          </div>
        </div>
      )}

      {/* Modal édition */}
      {editingTransaction && (
        <TransactionForm
          type={editingTransaction.type}
          editMode
          initialValues={{
            amount: editingTransaction.amount,
            category: editingTransaction.category,
            label: editingTransaction.label ?? undefined,
            date: editingTransaction.date.slice(0, 10),
            isRecurring: editingTransaction.isRecurring,
            recurrenceInterval: (editingTransaction.recurrenceInterval as "weekly" | "monthly" | "custom") ?? undefined,
          }}
          onSubmit={handleEdit}
          onCancel={() => setEditingTransaction(null)}
        />
      )}

      {showForm && (
        <>
          <TransactionForm
            type={showForm}
            onSubmit={handleCreate}
            onCancel={() => { setShowForm(null); setFormError(null); }}
          />
          {formError && (
            <div className="mt-2 px-4 py-3 bg-danger/10 border border-danger/20 rounded-xl text-sm text-danger font-medium">
              ⚠️ {formError}
            </div>
          )}
        </>
      )}


      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white shadow-soft text-textLight hover:text-textDark transition text-lg"
          aria-label="Mois précédent"
        >
          ‹
        </button>
        <h2 className="text-base font-semibold text-textDark capitalize">{monthLabel}</h2>
        <button
          onClick={() => navigateMonth(1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white shadow-soft text-textLight hover:text-textDark transition text-lg"
          aria-label="Mois suivant"
        >
          ›
        </button>
      </div>

      {/* Overview */}
      <div className="mb-5">
        <BudgetOverview {...summary} prevMonthExpenses={prevMonthExpenses} top3={top3} warningThreshold={summary.warningThreshold} />
      </div>

      {/* Add buttons */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <button
          onClick={() => setShowForm("expense")}
          className="flex items-center justify-center gap-2 bg-danger hover:bg-danger/90 text-white font-semibold py-3 rounded-2xl transition"
        >
          <span className="text-lg leading-none">−</span>
          Dépense
        </button>
        <button
          onClick={() => setShowForm("income")}
          className="flex items-center justify-center gap-2 bg-success hover:bg-success/90 text-white font-semibold py-3 rounded-2xl transition"
        >
          <span className="text-lg leading-none">+</span>
          Revenu
        </button>
      </div>

      {/* Charts (dépenses only) */}
      {expenseTransactions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <CategoryPie data={summary.byCategory} />
          <MonthlyChart data={weeklyData} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(["all", "income", "expense"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === tab ? "bg-primary text-white" : "bg-white shadow-soft text-textLight hover:text-textDark"
            }`}
          >
            {tab === "all" ? "Tout" : tab === "income" ? "💵 Revenus" : "💸 Dépenses"}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      <TransactionList transactions={filteredTransactions} onDelete={handleDelete} onEdit={setEditingTransaction} />

    </div>
  );
}
