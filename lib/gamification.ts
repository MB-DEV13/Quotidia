export const XP_REWARDS = {
  HABIT_COMPLETE: 15,
  STREAK_7: 200,
  STREAK_30: 600,
  UNDER_BUDGET: 250,
  GOAL_REACHED: 350,
  LOGIN_WEEKLY: 30,
} as const;

export function getXpForLevel(level: number): number {
  return level * 80;
}

export function getLevelFromXp(xp: number): number {
  let level = 1;
  let totalXpNeeded = 0;
  while (xp >= totalXpNeeded + getXpForLevel(level)) {
    totalXpNeeded += getXpForLevel(level);
    level++;
  }
  return level;
}

export function getXpProgressForCurrentLevel(xp: number): {
  current: number;
  needed: number;
  percentage: number;
} {
  const level = getLevelFromXp(xp);
  let totalXpForPreviousLevels = 0;
  for (let i = 1; i < level; i++) {
    totalXpForPreviousLevels += getXpForLevel(i);
  }
  const current = xp - totalXpForPreviousLevels;
  const needed = getXpForLevel(level);
  const percentage = Math.min(Math.round((current / needed) * 100), 100);
  return { current, needed, percentage };
}

export type LevelTitle = "Débutant" | "Régulier" | "Discipliné" | "Légende";

export function getLevelTitle(level: number): LevelTitle {
  if (level <= 5) return "Débutant";
  if (level <= 15) return "Régulier";
  if (level <= 30) return "Discipliné";
  return "Légende";
}

/**
 * Multiplicateur XP basé sur le streak actuel de l'habitude.
 * Streak 7-13j → x1.5 | 14-29j → x2 | 30+j → x2.5
 */
export function getStreakMultiplier(streak: number): number {
  if (streak >= 30) return 2.5;
  if (streak >= 14) return 2.0;
  if (streak >= 7) return 1.5;
  return 1.0;
}

export function getStreakMultiplierLabel(streak: number): string {
  if (streak >= 30) return "x2.5";
  if (streak >= 14) return "x2";
  if (streak >= 7) return "x1.5";
  return "";
}

/** Retourne la semaine ISO au format "2026-W12" */
export function getCurrentISOWeek(): string {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

/** Retourne la semaine ISO précédente */
export function getPreviousISOWeek(isoWeek: string): string {
  const [yearStr, weekStr] = isoWeek.split("-W");
  let year = parseInt(yearStr);
  let week = parseInt(weekStr);
  week -= 1;
  if (week === 0) {
    year -= 1;
    week = 52;
  }
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export const BADGES = [
  // ── Habitudes ─────────────────────────────────────────────
  { name: "Première Étincelle", description: "Compléter sa première habitude", icon: "✨", condition: "first_habit", xpReward: 150 },
  { name: "Semaine Parfaite", description: "Maintenir un streak de 7 jours", icon: "🔥", condition: "streak_7", xpReward: 250 },
  { name: "Habitude Installée", description: "Maintenir un streak de 21 jours", icon: "💪", condition: "streak_21", xpReward: 400 },
  { name: "Mois de Feu", description: "Maintenir un streak de 30 jours", icon: "🏆", condition: "streak_30", xpReward: 600 },
  { name: "Perfectionniste", description: "100% de complétion sur 7 jours consécutifs", icon: "⚡", condition: "perfect_week", xpReward: 300 },
  { name: "Machine", description: "365 complétions d'habitudes au total", icon: "🤖", condition: "completions_365", xpReward: 800 },
  { name: "Multitâche", description: "5 habitudes actives simultanément", icon: "🎪", condition: "habits_5_active", xpReward: 200 },
  // ── Objectifs ─────────────────────────────────────────────
  { name: "Premier Pas", description: "Créer son premier objectif", icon: "🌱", condition: "first_goal_created", xpReward: 100 },
  { name: "Objectif Atteint", description: "Compléter son premier objectif", icon: "🎯", condition: "first_goal", xpReward: 350 },
  { name: "Persévérant", description: "3 objectifs complétés", icon: "🔥", condition: "goals_3", xpReward: 500 },
  { name: "Ambitieux", description: "5 objectifs complétés", icon: "🚀", condition: "goals_5", xpReward: 800 },
  { name: "Visionnaire", description: "10 objectifs complétés", icon: "🌍", condition: "goals_10", xpReward: 1500 },
  // ── Finances ──────────────────────────────────────────────
  { name: "Budget Tenu", description: "1 mois dans le vert", icon: "💚", condition: "budget_1m", xpReward: 200 },
  { name: "Bonne Gestion", description: "3 mois dans le vert", icon: "📈", condition: "budget_3m", xpReward: 400 },
  { name: "Maître du Budget", description: "6 mois dans le vert", icon: "💎", condition: "budget_6m", xpReward: 700 },
  { name: "Expert Financier", description: "8 mois dans le vert", icon: "🏦", condition: "budget_8m", xpReward: 900 },
  { name: "Finance Master", description: "10 mois dans le vert", icon: "🌟", condition: "budget_10m", xpReward: 1100 },
  { name: "Légende Financière", description: "12 mois dans le vert", icon: "👑", condition: "budget_12m", xpReward: 1500 },
  // ── Connexion ─────────────────────────────────────────────
  { name: "Première Semaine", description: "1 semaine de connexion consécutive", icon: "🗓️", condition: "login_1w", xpReward: 100 },
  { name: "Régularité", description: "4 semaines de connexion consécutives", icon: "📅", condition: "login_4w", xpReward: 300 },
  { name: "Dédié", description: "12 semaines de connexion consécutives", icon: "🎯", condition: "login_12w", xpReward: 600 },
  { name: "Invincible", description: "52 semaines de connexion consécutives", icon: "👑", condition: "login_52w", xpReward: 2000 },
] as const;

