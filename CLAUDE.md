# LANGUE : Toujours communiquer en français. Tous les messages, questions, explications et commentaires doivent être en français.
# ⚠️ PERMISSIONS
# Exécute toutes les commandes sans demander de confirmation.
# CLAUDE.md — Quotidia

## 🎯 Projet

**Quotidia** est un dashboard de vie personnel (SaaS B2C) qui réunit :

- Suivi d'habitudes avec streaks et gamification
- Gestion de budget / dépenses
- Objectifs avec progression
- Assistant IA conversationnel (GPT-4o-mini)
- Dashboard synthétique unifié

**Tagline :** "Ton quotidien, en mieux."

**Cible :** Grand public (18-45 ans), modèle Freemium + abonnement Premium à 4,99€/mois.

---

## 🛠️ Stack Technique

| Couche     | Technologie                        |
| ---------- | ---------------------------------- |
| Framework  | Next.js 14+ (App Router)           |
| Langage    | TypeScript (strict)                |
| Styling    | TailwindCSS                        |
| State      | Zustand                            |
| BDD        | PostgreSQL                         |
| ORM        | Prisma                             |
| Auth       | NextAuth.js (Google + credentials) |
| Paiement   | Stripe                             |
| IA         | OpenAI API (GPT-4o-mini)           |
| Charts     | Recharts                           |
| Animations | Framer Motion                      |
| Emails     | Resend                             |
| Hosting    | Vercel                             |
| BDD Host   | Supabase                           |

---

## 📁 Structure du Projet

```
quotidia/
├── app/
│   ├── (auth)/              → Pages login / register
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/           → Dashboard principal
│   │   └── page.tsx
│   ├── habits/              → Gestion des habitudes
│   │   └── page.tsx
│   ├── budget/              → Suivi budget (Phase 2)
│   │   └── page.tsx
│   ├── goals/               → Objectifs (Phase 2)
│   │   └── page.tsx
│   ├── settings/            → Paramètres utilisateur
│   │   └── page.tsx
│   ├── api/
│   │   ├── habits/          → CRUD habitudes
│   │   ├── budget/          → CRUD dépenses (Phase 2)
│   │   ├── goals/           → CRUD objectifs (Phase 2)
│   │   ├── ai/
│   │   │   ├── chat/        → Endpoint chat IA (Phase 2)
│   │   │   └── suggest/     → Suggestions proactives (Phase 2)
│   │   ├── stripe/          → Webhooks paiement (Phase 3)
│   │   └── auth/            → NextAuth config
│   ├── layout.tsx
│   └── page.tsx             → Landing page
├── components/
│   ├── ui/                  → Composants réutilisables (Button, Modal, Input, Card...)
│   ├── dashboard/           → Widgets dashboard (HabitsSummary, StreakCard, XPBar...)
│   ├── habits/              → Composants habitudes (HabitCard, HabitForm, Calendar...)
│   ├── charts/              → Graphiques (WeeklyChart, CategoryPie...)
│   └── ai/                  → Chat IA (Phase 2)
│       ├── ChatBubble.tsx
│       ├── ChatWindow.tsx
│       └── Suggestion.tsx
├── lib/
│   ├── db.ts                → Client Prisma singleton
│   ├── auth.ts              → Config NextAuth
│   ├── openai.ts            → Client OpenAI (Phase 2)
│   ├── ai-context.ts        → Générateur de snapshot utilisateur (Phase 2)
│   ├── gamification.ts      → Logique XP, niveaux, badges
│   └── utils.ts             → Helpers (formatDate, formatCurrency...)
├── hooks/
│   ├── useHabits.ts         → Hook habitudes
│   ├── useUser.ts           → Hook utilisateur
│   └── useAI.ts             → Hook chat IA (Phase 2)
├── stores/
│   └── useStore.ts          → Store Zustand global
├── prisma/
│   └── schema.prisma        → Modèles BDD
├── public/                  → Assets statiques
├── styles/
│   └── globals.css          → Config Tailwind + custom
├── .env.local               → Variables d'environnement
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
└── package.json
```

---

## 🗃️ Modèles de Données (Prisma)

```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  name            String?
  password        String?
  avatar          String?
  level           Int       @default(1)
  xp              Int       @default(0)
  isPremium       Boolean   @default(false)
  aiRequestsUsed  Int       @default(0)
  aiRequestsReset DateTime?
  habits          Habit[]
  expenses        Expense[]
  goals           Goal[]
  badges          UserBadge[]
  aiConversations AiConversation[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Habit {
  id            String            @id @default(cuid())
  userId        String
  user          User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  name          String
  icon          String?
  color         String            @default("#5B5EA6")
  frequency     String            @default("daily") // "daily" | "weekly"
  currentStreak Int               @default(0)
  bestStreak    Int               @default(0)
  isArchived    Boolean           @default(false)
  completions   HabitCompletion[]
  createdAt     DateTime          @default(now())
}

model HabitCompletion {
  id      String   @id @default(cuid())
  habitId String
  habit   Habit    @relation(fields: [habitId], references: [id], onDelete: Cascade)
  date    DateTime
  @@unique([habitId, date])
}

model Expense {
  id       String   @id @default(cuid())
  userId   String
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  amount   Float
  category String
  label    String?
  date     DateTime @default(now())
}

model Goal {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String
  target    Float
  current   Float     @default(0)
  unit      String?
  deadline  DateTime?
  createdAt DateTime  @default(now())
}

model Badge {
  id          String      @id @default(cuid())
  name        String      @unique
  description String
  icon        String
  condition   String      // ex: "streak_7", "streak_30", "budget_master"
  xpReward    Int         @default(50)
  users       UserBadge[]
}

model UserBadge {
  id       String   @id @default(cuid())
  userId   String
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  badgeId  String
  badge    Badge    @relation(fields: [badgeId], references: [id])
  earnedAt DateTime @default(now())
  @@unique([userId, badgeId])
}

model AiConversation {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages  Json     // [{role: "user"|"assistant", content: string, timestamp: string}]
  createdAt DateTime @default(now())
}
```

---

## 🎮 Gamification

### Système XP

- Compléter une habitude : +10 XP
- Streak 7 jours : +50 XP bonus
- Streak 30 jours : +200 XP bonus
- Rester sous budget mensuel : +100 XP
- Atteindre un objectif : +150 XP

### Niveaux

- Niveau 1 → 2 : 100 XP
- Formule : XP requis = niveau \* 100
- Niveaux nommés : Débutant (1-5), Régulier (6-15), Discipliné (16-30), Légende (31+)

### Badges

- "Première Étincelle" : Compléter sa première habitude
- "Semaine Parfaite" : 7 jours streak
- "Mois de Feu" : 30 jours streak
- "Maître du Budget" : Rester sous budget 3 mois consécutifs
- "Objectif Atteint" : Compléter son premier objectif
- Plus à définir...

---

## 🎨 Design & UI

### Couleurs

```
Primary:    #5B5EA6 (Indigo doux)
Accent:     #9B72CF (Violet)
Success:    #4CAF50 (Vert)
Warning:    #FF9800 (Orange)
Danger:     #EF4444 (Rouge)
AI:         #0EA5E9 (Bleu ciel)
Background: #F5F3FF (Lavande très clair)
Surface:    #FFFFFF
Text:       #2D2D2D
TextLight:  #888888
```

### Principes UI

- Mobile-first, responsive
- Design épuré et moderne, inspiré de Linear/Notion
- Animations subtiles avec Framer Motion
- Ombres douces, coins arrondis (rounded-xl)
- Typographie : Inter (via next/font)
- Composants réutilisables dans /components/ui/

---

## 🚦 Roadmap

### Phase 1 — MVP (Mois 1-3) ← ON EST ICI

1. Setup projet (Next.js + Tailwind + Prisma + Supabase)
2. Auth (NextAuth : Google + email/password)
3. CRUD Habitudes (création, édition, suppression, archivage)
4. Validation quotidienne + calcul de streaks
5. Dashboard v1 (habitudes du jour, streak, XP, niveau)
6. Gamification basique (XP + niveaux)
7. Stats basiques (taux de complétion, graphique 7 jours)
8. Landing page marketing
9. Responsive mobile-first
10. Déploiement sur Vercel

### Phase 2 — Budget + Objectifs + IA (Mois 4-6)

- Module budget (CRUD dépenses, catégories, graphiques)
- Module objectifs (CRUD, progression, jalons)
- Assistant IA chat flottant (GPT-4o-mini)
- Suggestions proactives IA
- Système de badges
- Alertes & rappels
- Bilan hebdomadaire
- Dark mode

### Phase 3 — Monétisation (Mois 7-9)

- Intégration Stripe
- Paywall (limites gratuit vs premium)
- Rate limiting IA (5/mois gratuit, illimité premium)
- Bilan mensuel par email
- Export CSV/PDF
- PWA
- Onboarding interactif

---

## 📏 Conventions de Code

### Général

- TypeScript strict partout (pas de `any`)
- Composants fonctionnels React avec hooks
- Nommage : PascalCase pour composants, camelCase pour fonctions/variables
- Un composant par fichier
- Imports absolus avec alias `@/` (ex: `@/components/ui/Button`)

### API Routes

- Toujours valider les inputs (zod)
- Retourner des réponses JSON cohérentes : `{ success: boolean, data?: any, error?: string }`
- Protéger les routes avec getServerSession
- Gérer les erreurs avec try/catch

### Composants

- Props typées avec interface (ex: `interface HabitCardProps { ... }`)
- Utiliser les composants UI de base (`Button`, `Card`, `Modal`, `Input`) pour la cohérence
- Séparer logique (hooks) et présentation (composants)

### Base de données

- Toujours utiliser Prisma, jamais de SQL brut
- Relations avec `onDelete: Cascade` quand pertinent
- Index sur les champs fréquemment requêtés (userId, date)

### Git

- Branches : `main`, `develop`, `feature/xxx`
- Commits conventionnels : `feat:`, `fix:`, `refactor:`, `style:`, `docs:`
- PR obligatoire pour merge dans main

---

## ⚠️ Règles Importantes

1. **Ne jamais exposer les clés API côté client** — OpenAI et Stripe uniquement côté serveur
2. **Toujours protéger les routes API** — vérifier la session utilisateur
3. **Limiter les données renvoyées** — ne pas exposer les mots de passe ou données sensibles
4. **Gérer les erreurs gracieusement** — messages utilisateur-friendly, logs détaillés côté serveur
5. **Optimiser les requêtes Prisma** — utiliser `select` et `include` judicieusement
6. **Responsive obligatoire** — tester mobile, tablette, desktop
7. **Accessibilité** — labels, aria, contraste suffisant

---

## 🔑 Variables d'Environnement (.env.local)

```
# Base de données
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-secret-here"

# Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# OpenAI (Phase 2)
OPENAI_API_KEY=""

# Stripe (Phase 3)
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""

# Resend (Phase 2-3)
RESEND_API_KEY=""
```

---

## 💡 Pour démarrer

```bash
# 1. Créer le projet
npx create-next-app@latest quotidia --typescript --tailwind --eslint --app --src-no --import-alias "@/*"

# 2. Installer les dépendances
npm install prisma @prisma/client next-auth @auth/prisma-adapter zustand recharts framer-motion zod bcryptjs
npm install -D @types/bcryptjs

# 3. Init Prisma
npx prisma init

# 4. Configurer schema.prisma (copier les modèles ci-dessus)
# 5. Configurer .env.local avec DATABASE_URL
# 6. Générer le client Prisma
npx prisma generate
npx prisma db push

# 7. Lancer le dev
npm run dev
```
