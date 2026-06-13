# 🌀 Quotidia

> **Ton quotidien, en mieux.**

Quotidia est un dashboard de vie personnel SaaS (B2C) qui centralise le suivi d'habitudes, la gestion de budget, les objectifs et un assistant IA dans une seule interface. Modèle Freemium + abonnement Premium à 4,99 €/mois.

---

## Sommaire

- [Fonctionnalités](#-fonctionnalités)
- [Stack technique](#-stack-technique)
- [Architecture du projet](#-architecture-du-projet)
- [Installation & configuration](#-installation--configuration)
- [Variables d'environnement](#-variables-denvironnement)
- [Configuration centrale](#-configuration-centrale-libconfigts)
- [Base de données](#-base-de-données)
- [Authentification](#-authentification)
- [Paiements Stripe](#-paiements-stripe)
- [Assistant IA](#-assistant-ia)
- [Emails](#-emails)
- [Gamification](#-gamification)
- [Freemium & limites](#-freemium--limites)
- [Tâches planifiées (Crons)](#-tâches-planifiées-crons)
- [PWA & notifications push](#-pwa--notifications-push)
- [Sécurité](#-sécurité)
- [Déploiement](#-déploiement)
- [Roadmap](#-roadmap)

---

## ✨ Fonctionnalités

| Module            | Description                                                                       |
| ----------------- | --------------------------------------------------------------------------------- |
| **Habitudes**     | CRUD, validation quotidienne/hebdomadaire, calcul de streaks, archivage           |
| **Budget**        | Dépenses & revenus par catégorie, graphiques mensuels, solde, alertes dépassement |
| **Objectifs**     | Progression avec barre, jalons, date d'échéance                                   |
| **Coach IA**      | Chat conversationnel GPT-4o-mini, suggestions proactives contextualisées          |
| **Bilan**         | Rapport hebdomadaire web + téléchargement PDF + email Premium                     |
| **Gamification**  | XP, niveaux, badges, classement mondial                                           |
| **Classement**    | Leaderboard anonymisé par score XP                                                |
| **Export**        | Export CSV complet des données (Premium)                                          |
| **PWA**           | Installable sur mobile, notifications push                                        |
| **Sync bancaire** | Connexion Bridge by Bankin' PSD2 _(bientôt disponible)_                           |

---

## 🛠 Stack technique

| Couche             | Technologie              | Version |
| ------------------ | ------------------------ | ------- |
| Framework          | Next.js (App Router)     | 16.x    |
| Langage            | TypeScript strict        | 5.x     |
| Styling            | TailwindCSS              | 3.x     |
| State management   | Zustand                  | 5.x     |
| ORM                | Prisma                   | 5.x     |
| Base de données    | PostgreSQL (Supabase)    | —       |
| Auth               | NextAuth.js              | 4.x     |
| Paiements          | Stripe                   | 20.x    |
| IA                 | OpenAI SDK (GPT-4o-mini) | 6.x     |
| Charts             | Recharts                 | 2.x     |
| Animations         | Framer Motion            | 11.x    |
| Emails             | Resend                   | 6.x     |
| Rate limiting      | Upstash Redis            | 2.x     |
| PDF                | jsPDF                    | 4.x     |
| Notifications push | Web Push                 | 3.x     |
| Analytics          | PostHog                  | 1.x     |
| Anti-bot           | Cloudflare Turnstile     | —       |
| Hébergement        | Vercel (région cdg1)     | —       |

---

## 📁 Architecture du projet

```
quotidia/
├── app/
│   ├── (auth)/                  → Login, register, forgot/reset password
│   ├── dashboard/               → Dashboard principal
│   ├── habits/                  → Gestion des habitudes
│   ├── budget/                  → Budget & dépenses
│   ├── goals/                   → Objectifs
│   ├── bilan/                   → Rapport hebdomadaire
│   ├── classement/              → Leaderboard
│   ├── stats/                   → Statistiques avancées
│   ├── settings/                → Paramètres utilisateur
│   ├── upgrade/                 → Page Premium / Stripe checkout
│   ├── onboarding/              → Onboarding interactif (première connexion)
│   ├── contact/                 → Page contact
│   ├── offline/                 → Page hors-ligne (PWA)
│   ├── legal/
│   │   ├── mentions-legales/
│   │   ├── confidentialite/
│   │   └── cgu/
│   ├── api/
│   │   ├── auth/                → NextAuth + register + reset password
│   │   ├── habits/              → CRUD habitudes
│   │   ├── budget/              → CRUD dépenses
│   │   ├── income/              → CRUD revenus
│   │   ├── goals/               → CRUD objectifs
│   │   ├── ai/
│   │   │   ├── chat/            → Chat IA
│   │   │   └── suggest/         → Suggestion proactive
│   │   ├── bilan/               → Calcul du bilan hebdomadaire
│   │   ├── export/              → Export CSV & PDF
│   │   ├── leaderboard/         → Classement
│   │   ├── stripe/              → Checkout, portal, webhooks
│   │   ├── bridge/              → Connexion bancaire (Bridge by Bankin')
│   │   ├── push/                → Notifications push (subscribe/send)
│   │   ├── cron/
│   │   │   ├── daily/           → Cron quotidien (streak check, suggestions)
│   │   │   └── budget/          → Cron alertes budget
│   │   └── dev/test-emails/     → Prévisualisation emails (dev uniquement)
│   ├── opengraph-image.tsx      → Image OG dynamique
│   ├── layout.tsx               → Layout racine + metadata globales
│   └── page.tsx                 → Landing page marketing
│
├── components/
│   ├── ui/                      → Composants réutilisables (Button, Modal, CookieBanner…)
│   ├── layout/                  → Navbar, sidebar
│   ├── landing/                 → LandingNav, FAQSection, InteractiveMockup…
│   ├── dashboard/               → Widgets (AISuggestion, HabitsSummary…)
│   ├── habits/                  → HabitCard, HabitForm, calendrier
│   ├── budget/                  → BudgetClient, BankConnectionModal
│   ├── goals/                   → GoalCard, GoalForm
│   ├── ai/                      → ChatWindow, AITipCard
│   ├── bilan/                   → BilanClient (rapport + PDF)
│   ├── badges/                  → BadgesGrid
│   ├── onboarding/              → OnboardingModal
│   ├── settings/                → SettingsTabs, PdfBilanButton, ProfileEditor
│   └── upgrade/                 → UpgradePageClient
│
├── lib/
│   ├── config.ts                → ⭐ Configuration centrale (voir section dédiée)
│   ├── db.ts                    → Client Prisma singleton
│   ├── auth.ts                  → Config NextAuth
│   ├── openai.ts                → Client OpenAI
│   ├── ai-context.ts            → Snapshot utilisateur pour le contexte IA
│   ├── email-templates.ts       → Templates HTML des emails
│   ├── resend.ts                → Client Resend + adresses FROM
│   ├── gamification.ts          → Logique XP, niveaux, badges
│   ├── rate-limit.ts            → Rate limiting via Upstash Redis
│   └── utils.ts                 → Helpers (formatDate, formatCurrency…)
│
├── hooks/                       → useHabits, useUser, useAI…
├── stores/                      → Store Zustand global
├── types/                       → Types TypeScript partagés
├── prisma/
│   ├── schema.prisma            → Modèles BDD
│   └── seed.ts                  → Données de seed (badges)
├── middleware.ts                → Protection des routes authentifiées
├── next.config.js               → Config Next.js (CSP, cache, headers sécurité)
├── vercel.json                  → Région cdg1 + crons planifiés
├── tailwind.config.ts
└── lib/config.ts                → Configuration centrale ⭐
```

---

## 🚀 Installation & configuration

### Prérequis

- Node.js 20+
- npm ou pnpm
- Une instance PostgreSQL (ou un projet Supabase)
- Compte Vercel (pour le déploiement)

### 1. Cloner le repo

```bash
git clone <repo-url>
cd quotidia
npm install
```

### 2. Configurer les variables d'environnement

Copie `.env.local.example` (ou crée `.env.local`) et remplis les valeurs :

```bash
cp .env.local.example .env.local
```

Voir la [section Variables d'environnement](#-variables-denvironnement) pour le détail.

### 3. Initialiser la base de données

```bash
# Générer le client Prisma
npx prisma generate

# Créer les tables (développement)
npx prisma db push

# Ou, avec migrations (production)
npx prisma migrate deploy

# Seeder les badges
npm run seed
```

### 4. Lancer le serveur de développement

```bash
npm run dev
```

L'app est disponible sur [http://localhost:3000](http://localhost:3000).

### 5. Build de production

```bash
npm run build   # Génère le client Prisma puis build Next.js
npm run start
```

---

## 🔑 Variables d'environnement

Crée un fichier `.env.local` à la racine :

```env
# ── Base de données ──────────────────────────────────────────
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# ── NextAuth ─────────────────────────────────────────────────
NEXTAUTH_URL="http://localhost:3000"        # https://myquotidia.app en prod
NEXTAUTH_SECRET="generate-with-openssl"    # openssl rand -base64 32

# ── Google OAuth ─────────────────────────────────────────────
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# ── OpenAI ───────────────────────────────────────────────────
OPENAI_API_KEY=""

# ── Stripe ───────────────────────────────────────────────────
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
STRIPE_PRICE_MONTHLY=""                    # ID du prix mensuel Stripe
STRIPE_PRICE_YEARLY=""                     # ID du prix annuel Stripe

# ── Resend (emails) ──────────────────────────────────────────
RESEND_API_KEY=""

# ── Upstash Redis (rate limiting) ────────────────────────────
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# ── Web Push (notifications) ─────────────────────────────────
NEXT_PUBLIC_VAPID_PUBLIC_KEY=""
VAPID_PRIVATE_KEY=""

# ── Cloudflare Turnstile (anti-bot) ──────────────────────────
NEXT_PUBLIC_TURNSTILE_SITE_KEY=""
TURNSTILE_SECRET_KEY=""

# ── PostHog (analytics) ──────────────────────────────────────
NEXT_PUBLIC_POSTHOG_KEY=""
NEXT_PUBLIC_POSTHOG_HOST="https://eu.i.posthog.com"

# ── Bridge by Bankin' (connexion bancaire) ───────────────────
BRIDGE_CLIENT_ID=""
BRIDGE_CLIENT_SECRET=""
BRIDGE_WEBHOOK_SECRET=""
```

> **Génération de la clé VAPID**
>
> ```bash
> npx web-push generate-vapid-keys
> ```

---

## ⚙️ Configuration centrale (`lib/config.ts`)

Toute l'identité de l'application est centralisée dans un seul fichier. Modifier une valeur ici la propage **automatiquement** partout dans le code (metadata, emails, PDF, IA, CGU…).

```typescript
// lib/config.ts
export const config = {
  app: {
    name: "Quotidia", // Nom affiché partout dans l'app
    tagline: "Ton quotidien, en mieux.",
    domain: "myquotidia.app",
    url: "https://myquotidia.app",
  },

  social: {
    twitter: "https://x.com/QuotidiaApp",
    instagram: "https://instagram.com/quotidia.app",
    facebook: "https://facebook.com/...",
  },

  features: {
    bankingEnabled: false, // Passer à true pour activer la sync Bridge
  },

  freemium: {
    maxHabits: 3,
    maxGoals: 2,
    maxBudgetCategories: 2,
    maxAiRequestsPerMonth: 5,
  },
} as const;
```

### Feature flags

| Flag             | Valeur par défaut | Effet                                                                              |
| ---------------- | ----------------- | ---------------------------------------------------------------------------------- |
| `bankingEnabled` | `false`           | `false` → modal "bientôt disponible" ; `true` → connexion réelle Bridge by Bankin' |

---

## 🗃️ Base de données

Le schéma Prisma est dans `prisma/schema.prisma`. Modèles principaux :

| Modèle             | Description                                                  |
| ------------------ | ------------------------------------------------------------ |
| `User`             | Compte utilisateur (email, nom, avatar, XP, niveau, Premium) |
| `Habit`            | Habitude (nom, icône, couleur, fréquence, streak)            |
| `HabitCompletion`  | Validation d'une habitude à une date donnée                  |
| `Expense`          | Dépense (montant, catégorie, libellé, date)                  |
| `Income`           | Revenu (montant, catégorie, libellé, date)                   |
| `BudgetCategory`   | Catégorie de budget avec enveloppe mensuelle                 |
| `Goal`             | Objectif (titre, cible, progression, échéance)               |
| `Badge`            | Définition d'un badge (condition, XP récompense)             |
| `UserBadge`        | Badges obtenus par un utilisateur                            |
| `AiConversation`   | Historique de conversation avec le Coach IA                  |
| `PushSubscription` | Abonnements aux notifications push                           |

### Commandes utiles

```bash
npx prisma studio          # Interface graphique BDD (localhost:5555)
npx prisma db push         # Synchronise le schéma sans migration
npx prisma migrate dev     # Crée une migration nommée
npx prisma migrate deploy  # Applique les migrations en production
npm run seed               # Insère les badges par défaut
```

---

## 🔐 Authentification

NextAuth.js v4 avec deux providers :

- **Google OAuth** — connexion rapide sans mot de passe
- **Credentials** — email + mot de passe (hashé bcrypt)

Le flux d'inscription inclut :

1. Création du compte + envoi d'un email de vérification (Resend)
2. Clic sur le lien de validation → compte activé
3. Redirection vers l'onboarding interactif

La protection des routes est assurée par `middleware.ts` via JWT. Les routes protégées incluent toutes les pages `dashboard`, `habits`, `budget`, `goals`, `settings`, etc., ainsi que toutes les API internes sensibles.

---

## 💳 Paiements Stripe

Deux plans disponibles :

| Plan            | Prix        | ID Stripe              |
| --------------- | ----------- | ---------------------- |
| Premium mensuel | 4,99 €/mois | `STRIPE_PRICE_MONTHLY` |
| Premium annuel  | 39,99 €/an  | `STRIPE_PRICE_YEARLY`  |

### Flux de paiement

1. L'utilisateur clique "Passer Premium" → `POST /api/stripe/checkout` → session Stripe Checkout
2. Retour sur `/upgrade?success=1` → mise à jour `isPremium = true` via webhook
3. Annulation → `POST /api/stripe/cancel` ou portail client → `POST /api/stripe/portal`

### Webhook Stripe (production)

```bash
# Écouter les webhooks en local
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Événements gérés : `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`.

---

## 🤖 Assistant IA

L'assistant utilise **GPT-4o-mini** via l'API OpenAI.

### Chat (`/api/ai/chat`)

- Contexte injecté : habitudes, streaks, dépenses du mois, objectifs, XP/niveau
- Historique de la conversation conservé dans `AiConversation` (JSON)
- Rate limitée : 5 req/mois (Gratuit), illimité (Premium)

### Suggestion proactive (`/api/ai/suggest`)

- Appelée depuis le widget dashboard `AISuggestion`
- Génère **un seul conseil court** basé sur le snapshot utilisateur
- Rendu côté serveur (React Server Component)

### Snapshot utilisateur (`lib/ai-context.ts`)

Construit un résumé textuel de l'état de l'utilisateur (habitudes actives, taux de complétion, streaks, budget, objectifs) transmis comme contexte au modèle.

---

## 📧 Emails

Tous les emails transitent par **Resend**. Les adresses FROM sont définies dans `lib/resend.ts` (dérivées de `config.app.domain`).

| Email                            | Déclencheur                           |
| -------------------------------- | ------------------------------------- |
| Confirmation d'inscription       | `POST /api/auth/register`             |
| Renvoi de confirmation           | `POST /api/auth/resend-verification`  |
| Réinitialisation de mot de passe | `POST /api/auth/forgot-password`      |
| Bilan hebdomadaire               | Cron quotidien (lundi matin, Premium) |

Les templates HTML sont dans `lib/email-templates.ts`.

> **Prévisualisation en dev** : `GET /api/dev/test-emails` — affiche tous les emails sans les envoyer.

---

## 🎮 Gamification

### XP

| Action                     | XP gagné      |
| -------------------------- | ------------- |
| Compléter une habitude     | +10 XP        |
| Streak 7 jours             | +50 XP bonus  |
| Streak 30 jours            | +200 XP bonus |
| Rester sous budget mensuel | +100 XP       |
| Atteindre un objectif      | +150 XP       |

### Niveaux

- Formule : `XP requis pour passer au niveau N = N × 100`
- Niveaux nommés : Débutant (1–5), Régulier (6–15), Discipliné (16–30), Légende (31+)

### Badges

Définis dans la BDD via `npm run seed`. Exemples :

| Badge              | Condition                      |
| ------------------ | ------------------------------ |
| Première Étincelle | Première habitude complétée    |
| Semaine Parfaite   | Streak 7 jours                 |
| Mois de Feu        | Streak 30 jours                |
| Maître du Budget   | Sous budget 3 mois consécutifs |
| Objectif Atteint   | Premier objectif complété      |

---

## 🔒 Freemium & limites

Les limites sont définies dans `lib/config.ts` et propagées via l'alias `FREE_LIMITS` :

| Limite             | Valeur |
| ------------------ | ------ |
| Habitudes actives  | 3      |
| Objectifs          | 2      |
| Catégories budget  | 2      |
| Requêtes IA / mois | 5      |

Un utilisateur Premium (`isPremium = true`) ne rencontre aucune limite. La mise à jour du statut Premium se fait exclusivement via les webhooks Stripe.

---

## ⏰ Tâches planifiées (Crons)

Configurées dans `vercel.json` (région `cdg1` — Paris) :

| Endpoint           | Schedule                 | Rôle                                                          |
| ------------------ | ------------------------ | ------------------------------------------------------------- |
| `/api/cron/daily`  | `0 16 * * *` (18h Paris) | Vérification streaks, suggestion proactive, bilan hebdo lundi |
| `/api/cron/budget` | `0 8 * * *` (10h Paris)  | Alertes dépassement de budget                                 |

---

## 📱 PWA & notifications push

L'application est une **Progressive Web App** installable depuis le navigateur.

- Manifest et service worker configurés dans `public/`
- Notifications push via Web Push (VAPID)
- Souscription stockée en BDD (`PushSubscription`)
- Modal d'installation : `components/ui/PWAInstallModal.tsx`

---

## 🛡️ Sécurité

- **Headers HTTP** : CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy — configurés dans `next.config.js`
- **Rate limiting** : Upstash Redis sur toutes les routes sensibles (auth, IA, export)
- **Mots de passe** : hashés avec bcrypt
- **Sessions** : JWT NextAuth, cookies HttpOnly
- **CAPTCHA** : Cloudflare Turnstile sur les formulaires d'inscription/connexion
- **CORS** : routes API protégées par `getServerSession`
- **Stripe** : signature de webhook vérifiée côté serveur

---

## 🚢 Déploiement

Le projet est prévu pour **Vercel** avec la région `cdg1` (Paris).

### Déploiement initial

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Variables d'environnement sur Vercel

Dans le dashboard Vercel, projet → Settings → Environment Variables, ajoute toutes les variables listées dans la section `.env.local`.

### Base de données

Utilise **Supabase** (PostgreSQL managé). Une fois le projet créé :

1. Copie la `DATABASE_URL` depuis Supabase → Settings → Database → Connection string (mode `Transaction`)
2. Lance `npx prisma migrate deploy` depuis ton terminal local ou en CI

### Post-déploiement

- Configurer les webhooks Stripe en pointant sur `https://ton-domaine/api/stripe/webhook`
- Vérifier les crons dans l'onglet "Cron Jobs" de Vercel

---

## 🗺️ Roadmap

### Phase 1 — MVP ✅

- Setup projet, auth, CRUD habitudes, streaks, dashboard, gamification basique, landing page, déploiement

### Phase 2 — Budget + Objectifs + IA ✅

- Module budget & revenus, module objectifs, Coach IA, suggestions proactives, badges, bilans, PWA

### Phase 3 — Monétisation ✅

- Stripe, paywall freemium/premium, rate limiting IA, bilan email, export CSV, onboarding

### Phase 4 — À venir

- [ ] Connexion bancaire automatique (Bridge by Bankin') — `config.features.bankingEnabled = true`
- [ ] App iOS / Android native
- [ ] Import de transactions bancaires

---

## 🤝 Contribution

```bash
# Créer une branche feature
git checkout -b feature/ma-feature

# Commit conventionnel
git commit -m "feat: description de la feature"

# PR vers main
git push origin feature/ma-feature
```

Convention de commits : `feat:` / `fix:` / `refactor:` / `style:` / `docs:`

---

## 📄 Licence

Projet privé — tous droits réservés.
© 2025 Quotidia · Développé par [Devlyn](https://devlyn.fr)
