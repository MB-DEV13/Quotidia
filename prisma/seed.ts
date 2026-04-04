import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const badges = [
    // ── Habitudes ─────────────────────────────────────────────
    { name: "Première Étincelle",  description: "Compléter sa première habitude",                   icon: "✨", condition: "first_habit",       xpReward: 150  },
    { name: "Semaine Parfaite",    description: "Maintenir un streak de 7 jours",                   icon: "🔥", condition: "streak_7",           xpReward: 250  },
    { name: "Habitude Installée",  description: "Maintenir un streak de 21 jours",                  icon: "💪", condition: "streak_21",          xpReward: 400  },
    { name: "Mois de Feu",         description: "Maintenir un streak de 30 jours",                  icon: "🏆", condition: "streak_30",          xpReward: 600  },
    { name: "Perfectionniste",     description: "100% de complétion sur 7 jours consécutifs",       icon: "⚡", condition: "perfect_week",       xpReward: 300  },
    { name: "Machine",             description: "365 complétions d'habitudes au total",             icon: "🤖", condition: "completions_365",    xpReward: 800  },
    { name: "Multitâche",          description: "5 habitudes actives simultanément",                icon: "🎪", condition: "habits_5_active",    xpReward: 200  },
    // ── Objectifs ─────────────────────────────────────────────
    { name: "Premier Pas",         description: "Créer son premier objectif",                       icon: "🌱", condition: "first_goal_created", xpReward: 100  },
    { name: "Objectif Atteint",    description: "Compléter son premier objectif",                   icon: "🎯", condition: "first_goal",         xpReward: 350  },
    { name: "Persévérant",         description: "3 objectifs complétés",                            icon: "🔥", condition: "goals_3",            xpReward: 500  },
    { name: "Ambitieux",           description: "5 objectifs complétés",                            icon: "🚀", condition: "goals_5",            xpReward: 800  },
    { name: "Visionnaire",         description: "10 objectifs complétés",                           icon: "🌍", condition: "goals_10",           xpReward: 1500 },
    // ── Finances ──────────────────────────────────────────────
    { name: "Budget Tenu",         description: "1 mois dans le vert",                              icon: "💚", condition: "budget_1m",          xpReward: 200  },
    { name: "Bonne Gestion",       description: "3 mois dans le vert",                              icon: "📈", condition: "budget_3m",          xpReward: 400  },
    { name: "Maître du Budget",    description: "6 mois dans le vert",                              icon: "💎", condition: "budget_6m",          xpReward: 700  },
    { name: "Expert Financier",    description: "8 mois dans le vert",                              icon: "🏦", condition: "budget_8m",          xpReward: 900  },
    { name: "Finance Master",      description: "10 mois dans le vert",                             icon: "🌟", condition: "budget_10m",         xpReward: 1100 },
    { name: "Légende Financière",  description: "12 mois dans le vert",                             icon: "👑", condition: "budget_12m",         xpReward: 1500 },
    // ── Connexion ─────────────────────────────────────────────
    { name: "Première Semaine",    description: "1 semaine de connexion consécutive",               icon: "🗓️", condition: "login_1w",           xpReward: 100  },
    { name: "Régularité",          description: "4 semaines de connexion consécutives",             icon: "📅", condition: "login_4w",           xpReward: 300  },
    { name: "Dédié",               description: "12 semaines de connexion consécutives",            icon: "🎯", condition: "login_12w",          xpReward: 600  },
    { name: "Invincible",          description: "52 semaines de connexion consécutives",            icon: "👑", condition: "login_52w",          xpReward: 2000 },
  ];

  for (const badge of badges) {
    await db.badge.upsert({
      where: { name: badge.name },
      create: badge,
      update: badge,
    });
    console.log(`✅ "${badge.name}" — ${badge.xpReward} XP`);
  }

  console.log(`\n🎉 ${badges.length} badges synchronisés !`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
