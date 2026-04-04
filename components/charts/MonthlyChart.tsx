"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface WeekData {
  week: string;
  amount: number;
}

interface MonthlyChartProps {
  data: WeekData[];
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  if (data.length === 0 || data.every((d) => d.amount === 0)) {
    return (
      <div className="bg-white rounded-2xl shadow-soft p-6 flex items-center justify-center h-48">
        <p className="text-textLight text-sm">Aucune dépense ce mois</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft p-6">
      <h3 className="text-sm font-semibold text-textDark mb-4">Dépenses par semaine</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 11, fill: "#888888" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#888888" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}€`}
          />
          <Tooltip
            formatter={(value: number) =>
              new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value)
            }
            contentStyle={{ borderRadius: "12px", border: "1px solid #f0f0f0", fontSize: "12px" }}
          />
          <Bar dataKey="amount" name="Dépenses" fill="#5B5EA6" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
