// ─────────────────────────────────────────────────────────────
//  lib/config.ts — Configuration centrale de Quotidia
//  Modifie ce fichier pour changer les paramètres globaux du site
// ─────────────────────────────────────────────────────────────

export const config = {

  // ── Informations de l'application ──────────────────────────
  app: {
    name: "Quotidia",
    tagline: "Ton quotidien, en mieux.",
    domain: "myquotidia.app",
    url: "https://myquotidia.app",
  },

  // ── Réseaux sociaux ─────────────────────────────────────────
  social: {
    twitter:   "https://x.com/QuotidiaApp",
    instagram: "https://instagram.com/quotidia.app",
    facebook:  "https://facebook.com/61572147742258",
  },

  // ── Feature flags ───────────────────────────────────────────
  features: {
    bankingEnabled: false, // Passer à true quand Bridge by Bankin' est en production
  },

  // ── Limites Freemium ────────────────────────────────────────
  freemium: {
    maxHabits:             3,
    maxGoals:              2,
    maxBudgetCategories:   2,
    maxAiRequestsPerMonth: 5,
  },

} as const;

// Alias rétrocompatible — les imports existants "FREE_LIMITS" continuent de fonctionner
export const FREE_LIMITS = {
  HABITS:                config.freemium.maxHabits,
  GOALS:                 config.freemium.maxGoals,
  BUDGET_CATEGORIES:     config.freemium.maxBudgetCategories,
  AI_REQUESTS_PER_MONTH: config.freemium.maxAiRequestsPerMonth,
} as const;
