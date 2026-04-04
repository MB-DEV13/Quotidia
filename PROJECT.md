# Quotidia — Spécifications Détaillées du Projet

> Ce fichier complète le `CLAUDE.md` avec les détails fonctionnels, le modèle économique et les spécifications de l'assistant IA.

---

## 🎯 Vision

Quotidia est un dashboard de vie personnel qui réunit suivi d'habitudes, gestion de budget, objectifs et statistiques dans une interface unique, élégante et gamifiée — enrichi par un assistant IA conversationnel qui coache l'utilisateur au quotidien.

L'objectif : remplacer les 3-4 apps que les gens utilisent au quotidien par une seule expérience unifiée, intelligente et motivante.

---

## 📋 Fonctionnalités Core

### 1. Dashboard Synthétique
Vue d'ensemble de ta journée/semaine en un seul écran :
- Habitudes du jour (complétées / restantes)
- Streak actuel et meilleur streak
- Barre XP et niveau
- Résumé budget du mois (Phase 2)
- Objectifs en cours avec progression (Phase 2)
- Tip IA du jour (Phase 2)

### 2. Tracker d'Habitudes
- Création d'habitudes personnalisées (nom, icône, couleur, fréquence)
- Fréquence : quotidienne ou hebdomadaire
- Validation en un clic
- Calendrier visuel style GitHub (contribution graph)
- Calcul automatique des streaks (série en cours + meilleur score)
- Archivage des habitudes inactives

### 3. Suivi Budget / Dépenses (Phase 2)
- Saisie rapide des dépenses en 2 clics
- Catégorisation : alimentation, transport, loisirs, logement, santé, abonnements, autres
- Budget mensuel par catégorie
- Graphiques : camembert par catégorie, barres par semaine/mois
- Alertes de dépassement de budget

### 4. Objectifs avec Progression (Phase 2)
- Définition d'objectifs SMART (titre, cible, unité, deadline)
- Barre de progression visuelle
- Jalons intermédiaires
- Lien possible avec des habitudes (ex: "Lire 12 livres" lié à l'habitude "Lire 30min/jour")

---

## 🤖 Assistant IA « Quotidia Coach » (Phase 2)

### Concept
Un chat flottant (bulle en bas à droite) avec suggestions proactives. L'IA analyse les données de l'utilisateur (habitudes, budget, objectifs) et donne des conseils personnalisés.

### Cas d'usage
- **Budget en déficit** → "Tes dépenses resto représentent 40% de ton budget. Tu pourrais économiser 80€ en cuisinant 2x/semaine."
- **Habitude en danger** → "Ton streak méditation est à 12 jours ! N'oublie pas de valider aujourd'hui."
- **Objectif en retard** → "Pour atteindre ton objectif épargne d'ici juin, il faudrait mettre 150€/mois de côté."
- **Question libre** → "Quelles dépenses je pourrais réduire ce mois-ci ?" → analyse personnalisée
- **Bilan conversationnel** → "Résume ma semaine" → réponse synthétique et motivante

### Suggestions Proactives
L'IA n'attend pas que l'utilisateur demande. Elle analyse en arrière-plan et affiche des micro-suggestions :
- Ouverture du dashboard → tip motivationnel ou alerte pertinente
- Après une grosse dépense → suggestion d'ajustement budget
- Fin de semaine → mini-bilan de la semaine
- Inactivité 3+ jours → notification de réengagement

### Architecture Technique IA
Le système fonctionne en 3 couches :
1. **Collecte de contexte** — API interne qui agrège les données utilisateur (habitudes récentes, budget du mois, objectifs) en un « snapshot » JSON compact (~200 tokens)
2. **System prompt** — Prompt structuré qui définit le rôle du coach + injecte le snapshot utilisateur + la question
3. **Appel GPT-4o-mini** — API OpenAI côté serveur (route API Next.js). Réponse streamée en temps réel vers le chat frontend

### Coût IA
- Modèle : GPT-4o-mini (OpenAI)
- Prix input : 0,15$ / million de tokens
- Prix output : 0,60$ / million de tokens
- Coût par requête : ~0,001$ (≈ 1 500 tokens moyen)
- Utilisateur actif (10 req/jour) : ~0,30$ / mois
- Utilisateur moyen (2 req/jour) : ~0,06$ / mois
- Marge sur abonnement 4,99€ : > 95%

### Accès IA
| | Gratuit | Premium |
|---|---|---|
| Requêtes chat | 5 / mois | Illimité |
| Suggestions proactives | — | Oui |
| Historique conversations | Dernière session | 30 jours |

---

## ✨ Fonctionnalités Bonus

### Gamification
- **Streaks** : séries de jours consécutifs
- **Badges** à débloquer (voir CLAUDE.md pour la liste)
- **Niveaux** : Débutant → Régulier → Discipliné → Légende
- **XP** gagnés en complétant habitudes, en restant sous budget, en atteignant des objectifs

### Graphiques & Stats Visuelles
Charts interactifs (Recharts) : évolution habitudes sur 7/30/90 jours, répartition dépenses par catégorie, progression objectifs dans le temps.

### Alertes & Rappels
Notifications push/email pour : habitudes du jour, dépassements budget, échéances objectifs, streaks en danger.

### Bilan Périodique
Résumé hebdo/mensuel automatique : taux de complétion des habitudes, bilan financier, objectifs atteints, meilleur streak. Consultable in-app ou envoyé par email (PDF en Premium).

---

## 💰 Modèle Freemium

| Fonctionnalité | Gratuit | Premium (4,99€/mois) |
|---|---|---|
| Habitudes | 3 max | Illimité |
| Budget | 1 catégorie | Catégories illimitées |
| Objectifs | 2 max | Illimité |
| Historique | 30 jours | Illimité |
| Assistant IA | 5 requêtes/mois | Illimité + suggestions proactives |
| Graphiques | Basiques | Avancés + tendances |
| Gamification | Streaks uniquement | Badges + Niveaux + XP |
| Bilan périodique | — | Hebdo + Mensuel |
| Thèmes | Clair uniquement | Clair + Sombre + custom |
| Export données | — | CSV / PDF |

**Prix :** 4,99€/mois ou 39,99€/an (2 mois offerts)
**Objectif conversion :** 5-8% des utilisateurs gratuits vers Premium dans les 6 premiers mois.

---

## 📈 Projections (Mois 12)

| Métrique | Conservateur | Optimiste |
|---|---|---|
| Utilisateurs inscrits | 1 000 | 5 000 |
| Taux de conversion | 5% | 8% |
| Abonnés Premium | 50 | 400 |
| MRR | 250€ | 2 000€ |
| Coût IA mensuel | 15€ | 120€ |
| ARR net | 2 800€ | 22 500€ |

### KPIs à suivre
1. DAU / MAU — engagement quotidien et mensuel
2. Retention J7 / J30 — taux de retour
3. Taux de conversion Free → Premium
4. Utilisation IA — requêtes/user, satisfaction
5. Churn rate — désabonnement mensuel
6. NPS — Net Promoter Score

---

## 🗺️ Roadmap Détaillée

### Phase 1 — MVP (Mois 1-3) ← PHASE ACTUELLE
| Fonctionnalité | Détails | Priorité |
|---|---|---|
| Auth | NextAuth : Google + email/password | ⭐ Critique |
| Dashboard | Vue synthétique : habitudes du jour, streak, XP | ⭐ Critique |
| Habitudes | CRUD, validation quotidienne, calendrier | ⭐ Critique |
| Streaks | Calcul auto des séries, meilleur streak | ⭐ Critique |
| XP & Niveaux | Gain d'XP par habitude, calcul de niveau | 🔶 Important |
| Stats basiques | Taux de complétion hebdo, graphique 7 jours | 🔶 Important |
| Responsive | Design mobile-first avec TailwindCSS | ⭐ Critique |
| Landing page | Page marketing avec CTA inscription | 🔶 Important |

### Phase 2 — Budget + Objectifs + IA (Mois 4-6)
| Fonctionnalité | Détails | Priorité |
|---|---|---|
| Budget | Saisie dépenses, catégories, graphiques | ⭐ Critique |
| Objectifs | CRUD objectifs, barre de progression, jalons | ⭐ Critique |
| Chat IA | Bulle flottante, endpoint OpenAI, streaming | ⭐ Critique |
| Suggestions IA | Analyse contexte + notifications proactives | 🔶 Important |
| Badges | Système de badges débloquables (10+) | 🔶 Important |
| Alertes | Rappels habitudes + alertes budget | 🔶 Important |
| Bilan hebdo | Résumé auto de la semaine (in-app) | 🔶 Important |
| Dashboard v2 | Intégration budget + objectifs + tip IA | ⭐ Critique |
| Dark mode | Thème sombre | 🟢 Nice-to-have |

### Phase 3 — Monétisation (Mois 7-9)
| Fonctionnalité | Détails | Priorité |
|---|---|---|
| Stripe | Intégration paiement, gestion abonnement | ⭐ Critique |
| Paywall | Limites gratuit/premium, upgrade flow | ⭐ Critique |
| Rate limit IA | 5 req/mois gratuit, illimité premium | ⭐ Critique |
| Bilan mensuel | Rapport détaillé par email (PDF) | 🔶 Important |
| Export | Export CSV/PDF des données | 🔶 Important |
| Stats avancées | Tendances, prédictions, comparaisons | 🔶 Important |
| PWA | Progressive Web App (installation mobile) | 🟢 Nice-to-have |
| Onboarding | Tutoriel interactif nouveaux utilisateurs | 🔶 Important |
