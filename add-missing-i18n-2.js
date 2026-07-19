const fs = require("fs");

function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] && typeof source[key] === "object" && !Array.isArray(source[key]) &&
      target[key] && typeof target[key] === "object" && !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

const frPath = "./messages/fr.json";
const enPath = "./messages/en.json";
const fr = JSON.parse(fs.readFileSync(frPath, "utf8"));
const en = JSON.parse(fs.readFileSync(enPath, "utf8"));

const frAdd = {
  budget: {
    categories: {
      Restaurant: "Restaurant",
      Carburant: "Carburant",
      Charges: "Charges",
      Pharmacie: "Pharmacie",
      Sport: "Sport",
      Voyages: "Voyages",
      "Vêtements": "Vêtements",
      Culture: "Culture",
      "High-tech": "High-tech",
      "Beauté": "Beauté",
      "Épargne": "Épargne",
      Salaire: "Salaire",
      Emploi2: "2ème emploi",
      Freelance: "Freelance",
      Vente: "Vente",
      Investissement: "Investissement",
      Bourse: "Bourse",
      Location: "Location",
      Allocation: "Allocation",
      Jeux: "Gains / Jeux",
      Autre: "Autre revenu",
    },
  },
  charts: {
    weekly: {
      titleHabits: "Taux de complétion — 7 jours",
      titleExpenses: "Dépenses — 7 jours",
      btnHabits: "Habitudes",
      btnExpenses: "Dépenses",
      tooltipCompletion: "Complétion : {rate}%",
      tooltipHabits: "{completed}/{total} habitudes",
    },
    monthly: {
      title: "Dépenses par semaine",
      empty: "Aucune dépense ce mois",
    },
  },
  ui: {
    avatarPicker: {
      tabEmoji: "😊 Choisir un emoji",
      tabPhoto: "📷 Ma photo",
      selected: "✓ sélectionné",
      importSuccess: "✅ Photo importée",
      changePicture: "Changer la photo",
      selectPicture: "Sélectionner une photo",
      sizeHint: "JPG, PNG, WebP · max 5 Mo",
      formatError: "Format non supporté. Utilise JPG, PNG ou WebP.",
      sizeError: "Image trop lourde (max 5 Mo).",
      loadError: "Erreur lors du chargement de l'image.",
    },
    locationPicker: {
      country: "Pays",
      countrySelect: "Sélectionner un pays",
      region: "Région",
      select: "Sélectionner",
      city: "Ville",
    },
  },
  dashboard: {
    today: "Aujourd'hui",
    level: "Niveau",
    weekPercent: "{rate}% cette semaine",
    streakDanger: "Streak en danger !",
    streakDangerMsg1: "Il te reste 1 habitude à valider avant minuit pour garder ton streak.",
    streakDangerMsgN: "Il te reste {count} habitudes à valider avant minuit pour garder ton streak.",
    budgetMonth: "Budget ce mois",
    seeAll: "Voir tout →",
    budgetOver: "⚠️ Dépassement de {amount}",
    budgetRemaining: "{amount} restants",
    configBudget: "Configure ton budget",
    configBudgetMsg: "Suis tes dépenses et reste dans le vert chaque mois.",
    start: "Commencer →",
    goalsTitle: "Objectifs",
    goalsActive: "Objectifs en cours",
    goalsNew: "+ Nouvel objectif",
    goalsCongrats: "Félicitations !",
    goalsCongratsMsg: "Tu as complété tous tes objectifs. C'est une vraie performance !",
    goalsEmpty: "Crée ton premier objectif",
    goalsEmptyMsg: "Définis une cible et suis ta progression jour après jour.",
    badges: {
      streak7:        { name: "Semaine Parfaite",   desc: "7 jours de streak" },
      streak21:       { name: "Habitude Installée", desc: "21 jours de streak" },
      streak30:       { name: "Mois de Feu",        desc: "30 jours de streak" },
      completions365: { name: "Machine",            desc: "365 complétions" },
      habits5:        { name: "Multitâche",         desc: "5 habitudes actives" },
      firstGoal:      { name: "Objectif Atteint",   desc: "1 objectif complété" },
      goals3:         { name: "Persévérant",        desc: "3 objectifs complétés" },
      login4w:        { name: "Régularité",         desc: "4 semaines de connexion" },
      login12w:       { name: "Dédié",              desc: "12 semaines de connexion" },
    },
  },
  settings: {
    export: {
      pdf: {
        financialSummary: "Résumé financier",
        income: "Revenus",
        expenses: "Dépenses",
        balance: "Solde",
        habits: "Habitudes",
        habitCol: "Habitude",
        streakCol: "Streak actuel",
        completionCol: "Taux de complétion",
        expensesSection: "Dépenses",
        incomesSection: "Revenus",
        labelCol: "Libellé",
        categoryCol: "Catégorie",
        amountCol: "Montant",
        goalsSection: "Objectifs",
        titleCol: "Titre",
        progressCol: "Progression",
        streakUnit: "j",
      },
    },
  },
};

const enAdd = {
  budget: {
    categories: {
      Restaurant: "Restaurant",
      Carburant: "Fuel",
      Charges: "Utilities",
      Pharmacie: "Pharmacy",
      Sport: "Sport",
      Voyages: "Travel",
      "Vêtements": "Clothing",
      Culture: "Culture",
      "High-tech": "Tech",
      "Beauté": "Beauty",
      "Épargne": "Savings",
      Salaire: "Salary",
      Emploi2: "2nd job",
      Freelance: "Freelance",
      Vente: "Sales",
      Investissement: "Investment",
      Bourse: "Stock market",
      Location: "Rental income",
      Allocation: "Benefits",
      Jeux: "Gambling / Games",
      Autre: "Other income",
    },
  },
  charts: {
    weekly: {
      titleHabits: "Completion rate — 7 days",
      titleExpenses: "Expenses — 7 days",
      btnHabits: "Habits",
      btnExpenses: "Expenses",
      tooltipCompletion: "Completion: {rate}%",
      tooltipHabits: "{completed}/{total} habits",
    },
    monthly: {
      title: "Weekly expenses",
      empty: "No expenses this month",
    },
  },
  ui: {
    avatarPicker: {
      tabEmoji: "😊 Choose an emoji",
      tabPhoto: "📷 My photo",
      selected: "✓ selected",
      importSuccess: "✅ Photo imported",
      changePicture: "Change photo",
      selectPicture: "Select a photo",
      sizeHint: "JPG, PNG, WebP · max 5 MB",
      formatError: "Unsupported format. Use JPG, PNG or WebP.",
      sizeError: "Image too large (max 5 MB).",
      loadError: "Error loading the image.",
    },
    locationPicker: {
      country: "Country",
      countrySelect: "Select a country",
      region: "Region",
      select: "Select",
      city: "City",
    },
  },
  dashboard: {
    today: "Today",
    level: "Level",
    weekPercent: "{rate}% this week",
    streakDanger: "Streak at risk!",
    streakDangerMsg1: "You have 1 habit left to complete before midnight to keep your streak.",
    streakDangerMsgN: "You have {count} habits left to complete before midnight to keep your streak.",
    budgetMonth: "Monthly budget",
    seeAll: "See all →",
    budgetOver: "⚠️ Over budget by {amount}",
    budgetRemaining: "{amount} remaining",
    configBudget: "Set up your budget",
    configBudgetMsg: "Track your expenses and stay in the green every month.",
    start: "Get started →",
    goalsTitle: "Goals",
    goalsActive: "Active goals",
    goalsNew: "+ New goal",
    goalsCongrats: "Congratulations!",
    goalsCongratsMsg: "You've completed all your goals. That's a real achievement!",
    goalsEmpty: "Create your first goal",
    goalsEmptyMsg: "Set a target and track your progress day by day.",
    badges: {
      streak7:        { name: "Perfect Week",      desc: "7-day streak" },
      streak21:       { name: "Habit Locked In",   desc: "21-day streak" },
      streak30:       { name: "Month on Fire",     desc: "30-day streak" },
      completions365: { name: "Machine",           desc: "365 completions" },
      habits5:        { name: "Multitasker",       desc: "5 active habits" },
      firstGoal:      { name: "Goal Reached",      desc: "1 goal completed" },
      goals3:         { name: "Persistent",        desc: "3 goals completed" },
      login4w:        { name: "Consistent",        desc: "4 weeks of logins" },
      login12w:       { name: "Dedicated",         desc: "12 weeks of logins" },
    },
  },
  settings: {
    export: {
      pdf: {
        financialSummary: "Financial summary",
        income: "Income",
        expenses: "Expenses",
        balance: "Balance",
        habits: "Habits",
        habitCol: "Habit",
        streakCol: "Current streak",
        completionCol: "Completion rate",
        expensesSection: "Expenses",
        incomesSection: "Income",
        labelCol: "Label",
        categoryCol: "Category",
        amountCol: "Amount",
        goalsSection: "Goals",
        titleCol: "Title",
        progressCol: "Progress",
        streakUnit: "d",
      },
    },
  },
};

const newFr = deepMerge(fr, frAdd);
const newEn = deepMerge(en, enAdd);
fs.writeFileSync(frPath, JSON.stringify(newFr, null, 2), "utf8");
fs.writeFileSync(enPath, JSON.stringify(newEn, null, 2), "utf8");
console.log("FR done");
console.log("EN done");
