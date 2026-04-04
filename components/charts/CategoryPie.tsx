"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
}

interface CategoryPieProps {
  data: CategoryData[];
}

const COLORS = [
  "#FF9800",
  "#5B5EA6",
  "#9B72CF",
  "#0EA5E9",
  "#4CAF50",
  "#EF4444",
  "#888888",
];

export function CategoryPie({ data }: CategoryPieProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-soft p-6 flex items-center justify-center h-64">
        <p className="text-textLight text-sm">Aucune donnée à afficher</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft p-6">
      <h3 className="text-sm font-semibold text-textDark mb-4">Répartition par catégorie</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={3}
            dataKey="amount"
            nameKey="category"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${entry.category}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) =>
              new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value)
            }
          />
          <Legend
            formatter={(value) => (
              <span style={{ fontSize: "12px", color: "#2D2D2D" }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
