"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface HabitData {
  name: string;
  icon: string;
  streak: number;
  done: boolean;
  color: string;
}

interface CategoryData {
  name: string;
  amount: number;
  budget: number;
  color: string;
}

interface GoalData {
  title: string;
  current: number;
  target: number;
  unit: string;
  icon: string;
}

interface TabData {
  id: string;
  label: string;
}

function HabitsView({
  habits,
  streakLabel,
}: {
  habits: HabitData[];
  streakLabel: (streak: number) => string;
}) {
  return (
    <div className="space-y-2.5">
      {habits.map((h) => (
        <div
          key={h.name}
          className={`flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 shadow-sm ${h.done ? "opacity-70" : ""}`}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
            style={{ backgroundColor: `${h.color}20` }}
          >
            {h.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-medium ${h.done ? "line-through text-gray-400" : "text-gray-800"}`}>
              {h.name}
            </p>
            <p className="text-xs text-gray-400">{streakLabel(h.streak)}</p>
          </div>
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center ${
              h.done ? "bg-green-500 text-white" : "border-2 border-gray-200"
            }`}
          >
            {h.done && (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function BudgetView({
  categories,
  budgetMonth,
  budgetValue,
  budgetRemaining,
}: {
  categories: CategoryData[];
  budgetMonth: string;
  budgetValue: string;
  budgetRemaining: string;
}) {
  return (
    <div className="space-y-2.5">
      <div className="bg-white rounded-xl p-3 shadow-sm">
        <div className="flex justify-between items-center mb-1.5">
          <p className="text-xs font-semibold text-gray-700">{budgetMonth}</p>
          <span className="text-xs font-bold text-orange-500">{budgetValue}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-orange-400 rounded-full"
            style={{ width: "88%" }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">{budgetRemaining}</p>
      </div>
      {categories.map((c) => {
        const pct = Math.min(Math.round((c.amount / c.budget) * 100), 100);
        return (
          <div key={c.name} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-sm">
            <div className="flex-1 min-w-0">
              <div className="flex justify-between mb-1">
                <p className="text-xs font-medium text-gray-700">{c.name}</p>
                <p
                  className="text-xs font-semibold"
                  style={{ color: c.amount > c.budget ? "#EF4444" : "#888" }}
                >
                  {c.amount}€
                </p>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: c.amount > c.budget ? "#EF4444" : c.color,
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GoalsView({ goals }: { goals: GoalData[] }) {
  return (
    <div className="space-y-2.5">
      {goals.map((g) => {
        const pct = Math.round((g.current / g.target) * 100);
        return (
          <div key={g.title} className="bg-white rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">{g.icon}</span>
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="text-xs font-semibold text-gray-800">{g.title}</p>
                  <span className="text-xs font-bold text-[#5B5EA6]">{pct}%</span>
                </div>
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#5B5EA6] to-[#9B72CF] rounded-full"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {g.current} / {g.target} {g.unit}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export function InteractiveMockup() {
  const [activeTab, setActiveTab] = useState("habits");
  const t = useTranslations("landing.mockup");

  const tabs = t.raw("tabs") as TabData[];
  const habits = t.raw("habits") as HabitData[];
  const budgetCategories = t.raw("budgetCategories") as CategoryData[];
  const goals = t.raw("goals") as GoalData[];

  return (
    <div className="bg-white rounded-3xl shadow-card border border-gray-100 overflow-hidden">
      {/* Fake browser bar */}
      <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <div className="w-3 h-3 rounded-full bg-green-400" />
        <div className="flex-1 mx-4 bg-white rounded-lg px-3 py-1 text-xs text-gray-400 border border-gray-200">
          quotidia.app/dashboard
        </div>
      </div>

      {/* Fake dashboard */}
      <div className="p-5 bg-[#F5F3FF]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-bold text-gray-800 text-sm">{t("headerGreeting")}</p>
            <p className="text-xs text-gray-400">{t("headerDate")}</p>
          </div>
          <div className="bg-gradient-to-r from-[#5B5EA6] to-[#9B72CF] text-white text-xs font-semibold px-3 py-1.5 rounded-full">
            ✨ Premium
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: t("statToday"), value: "4/5" },
            { label: t("statStreak"), value: t("streakLabel", { streak: 23 }) },
            { label: t("statLevel"), value: "12 ⭐" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-2.5 shadow-sm text-center">
              <p className="text-xs text-gray-400 mb-0.5">{s.label}</p>
              <p className="text-sm font-bold text-gray-800">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-xl p-1 gap-1 mb-4 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[#5B5EA6] text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="min-h-[180px]">
          {activeTab === "habits" && (
            <HabitsView
              habits={habits}
              streakLabel={(streak) => t("streakLabel", { streak })}
            />
          )}
          {activeTab === "budget" && (
            <BudgetView
              categories={budgetCategories}
              budgetMonth={t("budgetMonth")}
              budgetValue={t("budgetValue")}
              budgetRemaining={t("budgetRemaining", { amount: 80 })}
            />
          )}
          {activeTab === "goals" && <GoalsView goals={goals} />}
        </div>
      </div>
    </div>
  );
}
