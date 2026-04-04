"use client";

import { useState } from "react";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface HabitDay {
  day: string;
  completed: number;
  total: number;
  rate: number;
  goalAvg?: number;
}

interface ExpenseDay {
  day: string;
  amount: number;
}

interface WeeklyChartProps {
  habitsData: HabitDay[];
  expensesData: ExpenseDay[];
}

function HabitsTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; payload: HabitDay }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white rounded-xl shadow-card border border-gray-100 px-3 py-2 text-sm space-y-1">
      <p className="font-semibold text-textDark capitalize">{label}</p>
      <p className="text-primary font-medium">Complétion : {d.rate}%</p>
      <p className="text-textLight text-xs">{d.completed}/{d.total} habitudes</p>
    </div>
  );
}

function ExpensesTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-card border border-gray-100 px-3 py-2 text-sm">
      <p className="font-semibold text-textDark capitalize">{label}</p>
      <p className="text-warning font-medium">{payload[0].value.toFixed(2)} €</p>
    </div>
  );
}

export function WeeklyChart({ habitsData, expensesData }: WeeklyChartProps) {
  const [view, setView] = useState<"habits" | "expenses">("habits");
  const hasExpenses = expensesData.some((d) => d.amount > 0);

  return (
    <div className="bg-white rounded-2xl shadow-soft p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-textDark">
          {view === "habits" ? "Taux de complétion — 7 jours" : "Dépenses — 7 jours"}
        </h3>
        {hasExpenses && (
          <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
            <button
              onClick={() => setView("habits")}
              className={`text-xs px-3 py-1 rounded-md font-medium transition-all ${
                view === "habits" ? "bg-white text-primary shadow-sm" : "text-textLight hover:text-textDark"
              }`}
            >
              Habitudes
            </button>
            <button
              onClick={() => setView("expenses")}
              className={`text-xs px-3 py-1 rounded-md font-medium transition-all ${
                view === "expenses" ? "bg-white text-warning shadow-sm" : "text-textLight hover:text-textDark"
              }`}
            >
              Dépenses
            </button>
          </div>
        )}
      </div>

      {view === "habits" ? (
        <ResponsiveContainer width="100%" height={160}>
          <ComposedChart data={habitsData} barSize={24}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "#888" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
              width={36}
            />
            <Tooltip content={<HabitsTooltip />} cursor={{ fill: "#F5F3FF" }} />
            <Bar dataKey="rate" fill="#5B5EA6" radius={[6, 6, 0, 0]} name="Habitudes" />
          </ComposedChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <ComposedChart data={expensesData} barSize={24}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: "#888" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}€`}
              width={40}
            />
            <Tooltip content={<ExpensesTooltip />} cursor={{ fill: "#FFF7ED" }} />
            <Bar dataKey="amount" fill="#FF9800" radius={[6, 6, 0, 0]} name="Dépenses" />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
