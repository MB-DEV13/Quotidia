import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppShell } from "@/components/layout/AppShell";
import { BudgetClient } from "@/components/budget/BudgetClient";
import type { Transaction } from "@/components/budget/TransactionList";
import { generateOccurrenceDates, generateGroupId } from "@/lib/recurring";

interface BudgetPageProps {
  searchParams: Promise<{ month?: string; bridge?: string }>;
}

function getWeeklyData(expenses: { amount: number; date: Date }[]): { week: string; amount: number }[] {
  const weeks = [
    { week: "S1", amount: 0 },
    { week: "S2", amount: 0 },
    { week: "S3", amount: 0 },
    { week: "S4", amount: 0 },
  ];
  for (const expense of expenses) {
    const day = new Date(expense.date).getDate();
    const weekIndex = Math.min(Math.floor((day - 1) / 7), 3);
    weeks[weekIndex].amount += expense.amount;
  }
  return weeks.map((w) => ({ ...w, amount: Math.round(w.amount * 100) / 100 }));
}

/**
 * Rattrapage : pour les transactions récurrentes existantes sans recurringGroupId,
 * génère les occurrences manquantes jusqu'à aujourd'hui + 12 mois.
 */
async function catchUpRecurringTransactions(userId: string) {
  const now = new Date();
  const ceiling = new Date(now);
  ceiling.setMonth(ceiling.getMonth() + 12);

  // Expenses récurrentes sans groupId
  const legacyExpenses = await db.expense.findMany({
    where: { userId, isRecurring: true, recurringGroupId: null, recurrenceInterval: { not: null } },
  });

  for (const entry of legacyExpenses) {
    if (!entry.recurrenceInterval) continue;
    const groupId = generateGroupId();

    // Attribuer le groupId à l'entrée originale
    await db.expense.update({ where: { id: entry.id }, data: { recurringGroupId: groupId } });

    // Générer toutes les dates (sans la première qui existe déjà)
    const allDates = generateOccurrenceDates(entry.date, entry.recurrenceInterval, entry.recurrenceDays, 12);
    const occurrenceDates = allDates.slice(1).filter((d) => d <= ceiling);

    if (occurrenceDates.length === 0) continue;

    // Vérifier quelles dates existent déjà (même user, amount, category, date ±12h)
    const existingExpenses = await db.expense.findMany({
      where: {
        userId,
        amount: entry.amount,
        category: entry.category,
        isRecurring: true,
        date: { gte: allDates[1], lte: ceiling },
      },
      select: { date: true },
    });
    const existingMs = new Set(existingExpenses.map((e) => e.date.getTime()));

    const toCreate = occurrenceDates.filter((d) => {
      // Considère comme existante si une entrée est dans la même journée (±12h)
      return !Array.from(existingMs).some((ms) => Math.abs(ms - d.getTime()) < 12 * 60 * 60 * 1000);
    });

    if (toCreate.length > 0) {
      await db.expense.createMany({
        data: toCreate.map((date) => ({
          userId,
          amount: entry.amount,
          category: entry.category,
          label: entry.label,
          date,
          isRecurring: true,
          recurrenceInterval: entry.recurrenceInterval,
          recurrenceDays: entry.recurrenceDays,
          recurringGroupId: groupId,
        })),
      });
    }
  }

  // Incomes récurrents sans groupId
  const legacyIncomes = await db.income.findMany({
    where: { userId, isRecurring: true, recurringGroupId: null, recurrenceInterval: { not: null } },
  });

  for (const entry of legacyIncomes) {
    if (!entry.recurrenceInterval) continue;
    const groupId = generateGroupId();

    await db.income.update({ where: { id: entry.id }, data: { recurringGroupId: groupId } });

    const allDates = generateOccurrenceDates(entry.date, entry.recurrenceInterval, entry.recurrenceDays, 12);
    const occurrenceDates = allDates.slice(1).filter((d) => d <= ceiling);

    if (occurrenceDates.length === 0) continue;

    const existingIncomes = await db.income.findMany({
      where: {
        userId,
        amount: entry.amount,
        category: entry.category,
        isRecurring: true,
        date: { gte: allDates[1], lte: ceiling },
      },
      select: { date: true },
    });
    const existingMs = new Set(existingIncomes.map((e) => e.date.getTime()));

    const toCreate = occurrenceDates.filter((d) => {
      return !Array.from(existingMs).some((ms) => Math.abs(ms - d.getTime()) < 12 * 60 * 60 * 1000);
    });

    if (toCreate.length > 0) {
      await db.income.createMany({
        data: toCreate.map((date) => ({
          userId,
          amount: entry.amount,
          category: entry.category,
          label: entry.label,
          date,
          isRecurring: true,
          recurrenceInterval: entry.recurrenceInterval,
          recurrenceDays: entry.recurrenceDays,
          recurringGroupId: groupId,
        })),
      });
    }
  }
}

/**
 * Rattrapage : si le BudgetConfig a un incomeAmount > 0 mais aucun revenu
 * auto-généré (recurringGroupId = "cfg-income-{userId}"), on les crée.
 */
async function catchUpConfigIncome(userId: string) {
  const config = await db.budgetConfig.findUnique({ where: { userId } });
  if (!config || !config.configured || config.incomeAmount <= 0 || config.incomePeriod < 1) return;

  const groupId = `cfg-income-${userId}`;
  const existing = await db.income.count({ where: { userId, recurringGroupId: groupId } });
  if (existing > 0) return; // déjà généré

  const startDate = new Date();
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  const days = config.incomePeriod;
  const interval = days === 7 ? "weekly" : days === 30 ? "monthly" : "custom";
  const customDays = interval === "custom" ? days : undefined;

  const allDates = generateOccurrenceDates(startDate, interval, customDays ?? null, 12);
  if (allDates.length === 0) return;

  await db.income.createMany({
    data: allDates.map((date) => ({
      userId,
      amount: config.incomeAmount,
      category: "Salaire",
      label: config.incomeLabel ?? "Revenu",
      date,
      isRecurring: true,
      recurrenceInterval: interval,
      recurrenceDays: customDays ?? null,
      recurringGroupId: groupId,
    })),
  });
}

export default async function BudgetPage({ searchParams }: BudgetPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  // Rattrapage silencieux des transactions récurrentes existantes
  await catchUpRecurringTransactions(session.user.id);
  // Rattrapage des revenus auto issus de la config (si jamais générés)
  await catchUpConfigIncome(session.user.id);

  const resolvedParams = await searchParams;
  const monthParam = resolvedParams.month;
  const bridgeStatus = resolvedParams.bridge === "success" ? "success" : resolvedParams.bridge === "error" ? "error" : null;

  let startDate: Date;
  let endDate: Date;
  let currentMonth: string;

  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [year, month] = monthParam.split("-").map(Number);
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0, 23, 59, 59, 999);
    currentMonth = monthParam;
  } else {
    const now = new Date();
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }

  const prevMonthStart = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1);
  const prevMonthEnd = new Date(startDate.getFullYear(), startDate.getMonth(), 0, 23, 59, 59, 999);

  const [expenses, incomes, budgetConfig, userPlan, prevMonthAgg, bankConnection] = await Promise.all([
    db.expense.findMany({
      where: { userId: session.user.id, date: { gte: startDate, lte: endDate } },
      orderBy: { date: "desc" },
    }),
    db.income.findMany({
      where: { userId: session.user.id, date: { gte: startDate, lte: endDate } },
      orderBy: { date: "desc" },
    }),
    db.budgetConfig.findUnique({ where: { userId: session.user.id } }),
    db.user.findUnique({ where: { id: session.user.id }, select: { isPremium: true, budgetMode: true } }),
    db.expense.aggregate({
      where: { userId: session.user.id, date: { gte: prevMonthStart, lte: prevMonthEnd } },
      _sum: { amount: true },
    }),
    db.bankConnection.findUnique({
      where: { userId: session.user.id },
      select: { status: true, bankName: true, bankLogoUrl: true, lastSyncAt: true },
    }),
  ]);

  const prevMonthExpenses = prevMonthAgg._sum.amount ?? 0;

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

  // Plafond réel = revenu (incomeAmount), seuil d'alerte orange = monthlyBudget
  const budget = budgetConfig?.incomeAmount ?? 0;
  const warningThreshold = budgetConfig?.monthlyBudget && budgetConfig.monthlyBudget > 0
    ? budgetConfig.monthlyBudget
    : 0;

  const categoryMap = new Map<string, number>();
  for (const expense of expenses) {
    categoryMap.set(expense.category, (categoryMap.get(expense.category) ?? 0) + expense.amount);
  }
  const byCategory = Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const weeklyData = getWeeklyData(expenses.map((e) => ({ amount: e.amount, date: e.date })));

  // Merge and serialize transactions
  const transactions: Transaction[] = [
    ...expenses.map((e) => ({
      id: e.id,
      type: "expense" as const,
      amount: e.amount,
      category: e.category,
      label: e.label,
      date: e.date.toISOString(),
      isRecurring: e.isRecurring,
      recurrenceInterval: e.recurrenceInterval,
      source: e.source,
    })),
    ...incomes.map((i) => ({
      id: i.id,
      type: "income" as const,
      amount: i.amount,
      category: i.category,
      label: i.label,
      date: i.date.toISOString(),
      isRecurring: i.isRecurring,
      recurrenceInterval: i.recurrenceInterval,
      source: i.source,
    })),
  ];

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <BudgetClient
          initialTransactions={transactions}
          initialSummary={{ totalExpenses, totalIncome, budget, warningThreshold, byCategory }}
          weeklyData={weeklyData}
          currentMonth={currentMonth}
          budgetConfig={
            budgetConfig
              ? {
                  monthlyBudget: budgetConfig.monthlyBudget,
                  incomeAmount: budgetConfig.incomeAmount,
                  incomePeriod: budgetConfig.incomePeriod,
                  incomeLabel: budgetConfig.incomeLabel,
                  configured: budgetConfig.configured,
                }
              : null
          }
          isPremium={userPlan?.isPremium ?? false}
          prevMonthExpenses={prevMonthExpenses}
          budgetMode={userPlan?.budgetMode ?? "manual"}
          bankConnection={bankConnection ? {
            status: bankConnection.status,
            bankName: bankConnection.bankName,
            bankLogoUrl: bankConnection.bankLogoUrl,
            lastSyncAt: bankConnection.lastSyncAt?.toISOString() ?? null,
          } : null}
          bridgeStatus={bridgeStatus}
        />
      </div>
    </AppShell>
  );
}
