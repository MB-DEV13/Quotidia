"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { config } from "@/lib/config";

interface PdfBilanButtonProps {
  type: "weekly" | "monthly";
  isPremium: boolean;
}

export function PdfBilanButton({ type, isPremium }: PdfBilanButtonProps) {
  const t = useTranslations("settings.export");
  const locale = useLocale();
  const [loading, setLoading] = useState(false);

  const label = type === "weekly" ? t("weekly") : t("monthly");
  const icon = type === "weekly" ? "📅" : "📆";

  async function handleDownload() {
    if (!isPremium) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/export/bilan?type=${type}`);
      if (!res.ok) throw new Error(t("errorServer"));
      const data = await res.json();
      openPrintWindow(data, type, locale, t);
    } catch {
      alert(t("errorDownload"));
    } finally {
      setLoading(false);
    }
  }

  if (!isPremium) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-dashed border-gray-200 opacity-70">
        <span className="text-xl">{icon}</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-textDark">{label}</p>
          <p className="text-xs text-textLight">{t("premiumLocked")}</p>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-3 px-4 py-3 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-xl transition w-full text-left disabled:opacity-50"
    >
      <span className="text-xl">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-semibold text-primary">{label}</p>
        <p className="text-xs text-textLight">{t("downloadPdf")}</p>
      </div>
      {loading ? (
        <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
      ) : (
        <span className="text-primary text-lg flex-shrink-0">↓</span>
      )}
    </button>
  );
}

function openPrintWindow(
  data: Record<string, unknown>,
  type: "weekly" | "monthly",
  locale: string,
  t: (key: string) => string
) {
  const period = type === "weekly" ? t("weekly") : t("monthly");
  const dateLocale = locale === "fr" ? "fr-FR" : "en-US";
  const now = new Date().toLocaleDateString(dateLocale, { day: "numeric", month: "long", year: "numeric" });

  const habits = (data.habits as Array<{ name: string; currentStreak: number; completionRate: number }>) ?? [];
  const expenses = (data.expenses as Array<{ label?: string; category: string; amount: number; date: string }>) ?? [];
  const incomes = (data.incomes as Array<{ label?: string; category: string; amount: number; date: string }>) ?? [];
  const goals = (data.goals as Array<{ title: string; current: number; target: number; unit?: string }>) ?? [];
  const summary = data.summary as { totalExpenses: number; totalIncome: number; balance: number } | undefined;

  const html = `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8"/>
  <title>${config.app.name} — ${period}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #2D2D2D; padding: 40px; max-width: 800px; margin: auto; }
    h1 { font-size: 28px; font-weight: 800; color: #5B5EA6; margin-bottom: 4px; }
    .date { font-size: 13px; color: #888; margin-bottom: 32px; }
    h2 { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #888; margin: 24px 0 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; padding: 8px 12px; background: #F5F3FF; font-weight: 600; color: #5B5EA6; }
    td { padding: 8px 12px; border-bottom: 1px solid #f0f0f0; }
    .amount-neg { color: #EF4444; font-weight: 600; }
    .amount-pos { color: #4CAF50; font-weight: 600; }
    .summary-box { display: flex; gap: 16px; margin: 16px 0; }
    .summary-item { flex: 1; background: #F5F3FF; border-radius: 12px; padding: 14px 16px; }
    .summary-item .val { font-size: 20px; font-weight: 800; margin-top: 4px; }
    .footer { margin-top: 40px; font-size: 11px; color: #ccc; text-align: center; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>🌀 ${config.app.name} — ${period}</h1>
  <p class="date">${now}</p>

  ${summary ? `
  <h2>${t("pdf.financialSummary")}</h2>
  <div class="summary-box">
    <div class="summary-item"><div>${t("pdf.income")}</div><div class="val amount-pos">+${summary.totalIncome.toFixed(2)} €</div></div>
    <div class="summary-item"><div>${t("pdf.expenses")}</div><div class="val amount-neg">-${summary.totalExpenses.toFixed(2)} €</div></div>
    <div class="summary-item"><div>${t("pdf.balance")}</div><div class="val ${summary.balance >= 0 ? "amount-pos" : "amount-neg"}">${summary.balance >= 0 ? "+" : ""}${summary.balance.toFixed(2)} €</div></div>
  </div>` : ""}

  ${habits.length > 0 ? `
  <h2>${t("pdf.habits")} (${habits.length})</h2>
  <table>
    <tr><th>${t("pdf.habitCol")}</th><th>${t("pdf.streakCol")}</th><th>${t("pdf.completionCol")}</th></tr>
    ${habits.map((h) => `<tr><td>${h.name}</td><td>🔥 ${h.currentStreak}${t("pdf.streakUnit")}</td><td>${h.completionRate}%</td></tr>`).join("")}
  </table>` : ""}

  ${expenses.length > 0 ? `
  <h2>${t("pdf.expensesSection")} (${expenses.length})</h2>
  <table>
    <tr><th>${t("pdf.labelCol")}</th><th>${t("pdf.categoryCol")}</th><th>${t("pdf.amountCol")}</th><th>Date</th></tr>
    ${expenses.map((e) => `<tr><td>${e.label ?? "—"}</td><td>${e.category}</td><td class="amount-neg">-${e.amount.toFixed(2)} €</td><td>${new Date(e.date).toLocaleDateString(dateLocale)}</td></tr>`).join("")}
  </table>` : ""}

  ${incomes.length > 0 ? `
  <h2>${t("pdf.incomesSection")} (${incomes.length})</h2>
  <table>
    <tr><th>${t("pdf.labelCol")}</th><th>${t("pdf.categoryCol")}</th><th>${t("pdf.amountCol")}</th><th>Date</th></tr>
    ${incomes.map((i) => `<tr><td>${i.label ?? "—"}</td><td>${i.category}</td><td class="amount-pos">+${i.amount.toFixed(2)} €</td><td>${new Date(i.date).toLocaleDateString(dateLocale)}</td></tr>`).join("")}
  </table>` : ""}

  ${goals.length > 0 ? `
  <h2>${t("pdf.goalsSection")} (${goals.length})</h2>
  <table>
    <tr><th>${t("pdf.titleCol")}</th><th>${t("pdf.progressCol")}</th></tr>
    ${goals.map((g) => `<tr><td>${g.title}</td><td>${g.current}/${g.target}${g.unit ? " " + g.unit : ""} (${Math.min(Math.round((g.current / g.target) * 100), 100)}%)</td></tr>`).join("")}
  </table>` : ""}

  <div class="footer">${config.app.name} — ${config.app.tagline}</div>
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
