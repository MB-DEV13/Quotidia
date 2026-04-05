import { FAQSection } from "@/components/landing/FAQSection";
import { InteractiveMockup } from "@/components/landing/InteractiveMockupLazy";
import { LandingNav } from "@/components/landing/LandingNav";
import { PWAInstallModal } from "@/components/ui/PWAInstallModal";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Quotidia — Ton quotidien, en mieux.",
  description:
    "Suis tes habitudes, gère ton budget, atteins tes objectifs et booste ta productivité avec un assistant IA personnel. Gratuit pour commencer.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: "/",
  },
};

const FEATURES = [
  {
    icon: "✅",
    title: "Habitudes & Streaks",
    desc: "Construis des routines solides. Chaque jour validé alimente ton streak et te rapproche de tes objectifs.",
    color: "from-violet-500/10 to-primary/10",
    iconBg: "bg-primary/10 text-primary",
  },
  {
    icon: "💰",
    title: "Budget intelligent",
    desc: "Suis tes dépenses, relie ton compte bancaire pour une sync auto (Premium), et visualise où va ton argent en un coup d'œil.",
    color: "from-emerald-500/10 to-green-400/10",
    iconBg: "bg-emerald-500/10 text-emerald-600",
  },
  {
    icon: "🎯",
    title: "Objectifs concrets",
    desc: "Définis des objectifs SMART avec une barre de progression. Jalons, délais, tout est suivi automatiquement.",
    color: "from-orange-400/10 to-yellow-300/10",
    iconBg: "bg-orange-400/10 text-orange-500",
  },
  {
    icon: "🤖",
    title: "Coach IA personnel",
    desc: "Un assistant qui analyse tes données et te donne des conseils personnalisés, chaque jour.",
    color: "from-sky-400/10 to-blue-400/10",
    iconBg: "bg-sky-400/10 text-sky-500",
  },
  {
    icon: "🏆",
    title: "Gamification",
    desc: "Gagne des XP, monte de niveau, débloque des badges. Rester constant n'a jamais été aussi addictif.",
    color: "from-yellow-400/10 to-amber-300/10",
    iconBg: "bg-yellow-400/10 text-yellow-600",
  },
  {
    icon: "📊",
    title: "Stats & Bilans",
    desc: "Visualise tes progrès sur 7, 30 ou 90 jours. Reçois un bilan hebdo par email (Premium).",
    color: "from-purple-500/10 to-accent/10",
    iconBg: "bg-accent/10 text-accent",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Ça fait 18 jours que je tiens mon streak de méditation. Avant j'abandonnais au bout d'une semaine. Le fait de voir le streak qui monte, ça change tout.",
    name: "Sophie M.",
    role: "Enseignante",
    avatar: "👩‍🏫",
  },
  {
    quote:
      "J'ai enfin compris où partait mon argent. Le graphique par catégorie m'a montré que je dépensais 90€/mois en abonnements. J'ai économisé la moitié grâce au bon plan suggéré.",
    name: "Thomas K.",
    role: "Développeur",
    avatar: "👨‍💻",
  },
  {
    quote:
      "L'IA m'a conseillé de commencer par 10 minutes de lecture plutôt que 30. Depuis, je lis régulièrement sans me forcer.",
    name: "Léa D.",
    role: "Étudiante",
    avatar: "👩‍🎓",
  },
];

const PRICING = [
  {
    name: "Gratuit",
    price: "0€",
    period: "pour toujours",
    highlight: false,
    features: [
      "3 habitudes actives",
      "2 objectifs",
      "2 catégories budget / mois",
      "5 requêtes IA / mois",
      "Stats sur 7 jours",
      "Classement mondial",
    ],
  },
  {
    name: "Premium",
    price: "4,99€",
    period: "/ mois",
    highlight: true,
    badge: "⭐ Recommandé",
    features: [
      "Habitudes & objectifs illimités",
      "Catégories budget illimitées",
      "Connexion bancaire automatique",
      "Assistant IA sans limite",
      "Stats 30 & 90 jours",
      "Badges exclusifs & niveaux",
      "Bilan hebdo par email",
      "Export CSV",
      "Thème sombre",
    ],
  },
  {
    name: "Annuel",
    price: "39,99€",
    oldPrice: "59,99€",
    period: "/ an",
    highlight: false,
    badge: "🔥 2 mois offerts",
    features: [
      "Tout Premium inclus",
      "Soit 3,33€ / mois",
      "Économise 33%",
      "Paiement unique annuel",
      "Support prioritaire",
    ],
  },
];

const STEPS = [
  {
    num: "01",
    icon: "🚀",
    title: "Crée ton compte",
    desc: "Inscription en 30 secondes, sans carte bancaire. Connexion via Google ou email.",
  },
  {
    num: "02",
    icon: "⚙️",
    title: "Configure ton dashboard",
    desc: "Ajoute tes habitudes, saisis ton budget, définis tes objectifs. Tout en quelques minutes.",
  },
  {
    num: "03",
    icon: "📈",
    title: "Progresse chaque jour",
    desc: "Valide tes habitudes, suis tes dépenses, gagne de l'XP. Ton coach IA t'accompagne.",
  },
];

const COMPARISON = [
  {
    feature: "Habitudes + streaks",
    quotidia: true,
    notion: false,
    habitica: true,
    ynab: false,
  },
  {
    feature: "Budget & dépenses",
    quotidia: true,
    notion: false,
    habitica: false,
    ynab: true,
  },
  {
    feature: "Sync bancaire automatique",
    quotidia: true,
    notion: false,
    habitica: false,
    ynab: true,
  },
  {
    feature: "Objectifs avec jalons",
    quotidia: true,
    notion: true,
    habitica: false,
    ynab: false,
  },
  {
    feature: "Coach IA personnalisé",
    quotidia: true,
    notion: false,
    habitica: false,
    ynab: false,
  },
  {
    feature: "Gamification XP",
    quotidia: true,
    notion: false,
    habitica: true,
    ynab: false,
  },
  {
    feature: "Classement",
    quotidia: true,
    notion: false,
    habitica: true,
    ynab: false,
  },
  {
    feature: "Tout-en-un",
    quotidia: true,
    notion: false,
    habitica: false,
    ynab: false,
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Quotidia",
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Web, iOS, Android",
  offers: [
    {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
      name: "Gratuit",
    },
    {
      "@type": "Offer",
      price: "4.99",
      priceCurrency: "EUR",
      name: "Premium",
      billingIncrement: "P1M",
    },
  ],
  description:
    "Dashboard de vie personnel : suis tes habitudes, gère ton budget, atteins tes objectifs et booste ta productivité avec un assistant IA.",
  url: "https://myquotidia.app",
  inLanguage: "fr",
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Nav ──────────────────────────────────────────────────── */}
      <LandingNav />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-4 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold text-textDark mb-6 leading-tight tracking-tight">
            Ton quotidien,{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              en mieux.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-textLight max-w-2xl mx-auto mb-10 leading-relaxed">
            Quotidia réunit <strong className="text-textDark">habitudes</strong>
            , <strong className="text-textDark">budget</strong>,{" "}
            <strong className="text-textDark">objectifs</strong> et{" "}
            <strong className="text-textDark">assistant IA</strong> dans un seul
            dashboard élégant. Fini les 4 apps séparées.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/register"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-card text-base"
            >
              🚀 Commencer gratuitement
            </Link>
            <a
              href="#how"
              className="bg-white hover:bg-gray-50 text-primary font-semibold px-8 py-4 rounded-2xl border border-primary/20 transition-all shadow-soft text-base"
            >
              Voir comment ça marche →
            </a>
          </div>

        </div>
      </section>

      {/* ── Dashboard mockup interactif ───────────────────────────── */}
      <section className="px-4 pb-12">
        <div className="max-w-lg mx-auto">
          <p className="text-center text-xs font-semibold text-textLight uppercase tracking-widest mb-4">
            Explore le dashboard
          </p>
          <InteractiveMockup />
        </div>
      </section>

      {/* ── Comment ça marche ─────────────────────────────────────── */}
      <section id="how" className="px-4 py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              Simple & rapide
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-textDark mb-3">
              En seulement 3 étapes
            </h2>
            <p className="text-textLight">
              De zéro à un dashboard complet en moins de 5 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Ligne connectrice desktop */}
            <div className="hidden md:block absolute top-8 left-[calc(16.666%+1rem)] right-[calc(16.666%+1rem)] h-0.5 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30" />

            {STEPS.map((step) => (
              <div key={step.num} className="text-center relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-3xl mx-auto mb-4 shadow-soft relative z-10 bg-white">
                  {step.icon}
                </div>
                <div className="text-xs font-bold text-primary/50 uppercase tracking-widest mb-1">
                  {step.num}
                </div>
                <h3 className="text-base font-bold text-textDark mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-textLight leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/register"
              className="inline-block bg-gradient-to-r from-primary to-accent text-white font-bold px-8 py-3 rounded-2xl shadow-card hover:opacity-90 transition"
            >
              Commencer maintenant →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section id="features" className="px-4 py-20 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              Tout en un
            </p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-textDark mb-4">
              Tout ce dont tu as besoin
            </h2>
            <p className="text-textLight text-lg max-w-xl mx-auto">
              Remplace 4 apps par un seul espace qui comprend vraiment ton
              quotidien.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`bg-gradient-to-br ${f.color} rounded-2xl p-6 border border-white/60 hover:shadow-card transition-all`}
              >
                <div
                  className={`w-11 h-11 rounded-2xl ${f.iconBg} flex items-center justify-center text-xl mb-4`}
                >
                  {f.icon}
                </div>
                <h3 className="font-bold text-textDark text-base mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-textLight leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Coach IA mise en avant ───────────────────────────────── */}
      <section className="px-4 py-20 bg-gradient-to-br from-sky-50 to-blue-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
                🤖 Nouveau — Coach IA GPT-4o
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-textDark mb-5 leading-tight">
                Un coach qui te connaît vraiment
              </h2>
              <p className="text-textLight leading-relaxed mb-6">
                Ton assistant analyse{" "}
                <strong className="text-textDark">
                  tes habitudes, ton budget et tes objectifs
                </strong>{" "}
                en temps réel pour te donner des conseils adaptés à <em>ta</em>{" "}
                situation — pas des messages génériques.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Conseils personnalisés chaque matin selon tes données",
                  "Détecte tes points faibles et propose des ajustements",
                  "Chat disponible à tout moment pour répondre à tes questions",
                  "Suggestions proactives quand ton streak est en danger",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-textDark"
                  >
                    <span className="text-sky-500 font-bold mt-0.5 flex-shrink-0">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="inline-block bg-sky-500 hover:bg-sky-600 text-white font-semibold px-6 py-3 rounded-xl transition shadow-card text-sm"
              >
                Essayer le Coach IA →
              </Link>
            </div>
            {/* Chat mockup */}
            <div className="bg-white rounded-2xl shadow-card p-5 border border-sky-100">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-base">
                  🤖
                </div>
                <div>
                  <p className="text-xs font-semibold text-textDark">
                    Quotidia Coach
                  </p>
                  <p className="text-xs text-sky-500">En ligne</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-sky-50 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                  <p className="text-xs text-textDark leading-relaxed">
                    Bonjour Alex 👋 Ton streak sport est à 8 jours — t&apos;es
                    dans une belle dynamique ! Pense à valider ta séance
                    aujourd&apos;hui avant 17h.
                  </p>
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] ml-auto">
                  <p className="text-xs text-textDark">
                    J&apos;ai du mal à tenir mes séances en semaine...
                  </p>
                </div>
                <div className="bg-sky-50 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                  <p className="text-xs text-textDark leading-relaxed">
                    Je vois que tu valides surtout le week-end. Essaie de caler
                    une courte séance de 30 min le mardi et jeudi — moins
                    ambitieux, mais bien plus régulier. La constance bat
                    l&apos;intensité. 💪
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                <input
                  className="flex-1 text-xs bg-transparent outline-none text-textLight"
                  placeholder="Pose ta question..."
                  readOnly
                />
                <button
                  aria-label="Envoyer"
                  className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center flex-shrink-0"
                >
                  <svg
                    className="w-3.5 h-3.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Comparaison ──────────────────────────────────────────── */}
      <section className="px-4 py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              Pourquoi Quotidia ?
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-textDark mb-3">
              Une app pour tout remplacer
            </h2>
            <p className="text-textLight">
              Compare ce que tu obtiens avec Quotidia vs les autres.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left text-sm font-semibold text-textLight pb-4 pr-4">
                    Fonctionnalité
                  </th>
                  <th className="text-center pb-4 px-3">
                    <div className="inline-flex flex-col items-center gap-1">
                      <span className="text-lg">🌀</span>
                      <span className="text-xs font-bold text-primary">
                        Quotidia
                      </span>
                    </div>
                  </th>
                  <th className="text-center pb-4 px-3">
                    <div className="inline-flex flex-col items-center gap-1">
                      <span className="text-lg">📝</span>
                      <span className="text-xs font-medium text-textLight">
                        App to-do-list
                      </span>
                    </div>
                  </th>
                  <th className="text-center pb-4 px-3">
                    <div className="inline-flex flex-col items-center gap-1">
                      <span className="text-lg">✅</span>
                      <span className="text-xs font-medium text-textLight">
                        App habitudes
                      </span>
                    </div>
                  </th>
                  <th className="text-center pb-4 px-3">
                    <div className="inline-flex flex-col items-center gap-1">
                      <span className="text-lg">💳</span>
                      <span className="text-xs font-medium text-textLight">
                        App budget
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {COMPARISON.map((row) => (
                  <tr
                    key={row.feature}
                    className="hover:bg-gray-50/50 transition"
                  >
                    <td className="py-3 pr-4 text-sm text-textDark font-medium">
                      {row.feature}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm ${row.quotidia ? "bg-success/10 text-success" : "bg-gray-100 text-gray-300"}`}
                      >
                        {row.quotidia ? "✓" : "✗"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm ${row.notion ? "bg-success/10 text-success" : "bg-gray-100 text-gray-300"}`}
                      >
                        {row.notion ? "✓" : "✗"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm ${row.habitica ? "bg-success/10 text-success" : "bg-gray-100 text-gray-300"}`}
                      >
                        {row.habitica ? "✓" : "✗"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm ${row.ynab ? "bg-success/10 text-success" : "bg-gray-100 text-gray-300"}`}
                      >
                        {row.ynab ? "✓" : "✗"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-center text-xs text-textLight mt-6">
            Quotidia est la seule app qui combine <strong>tout</strong> dans une
            interface moderne et gamifiée.
          </p>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <section className="px-4 py-20 bg-gradient-to-br from-primary to-accent text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-12">
            Des résultats concrets
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                value: "72%",
                label:
                  "des utilisateurs maintiennent leurs habitudes après 3 semaines",
              },
              {
                value: "60€",
                label: "économisés en moyenne par mois grâce au suivi budget",
              },
              {
                value: "9j",
                label: "de streak moyen après 2 semaines d'utilisation",
              },
              { value: "4,7★", label: "satisfaction utilisateurs" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white/10 backdrop-blur rounded-2xl p-5"
              >
                <p className="text-3xl font-extrabold mb-2">{s.value}</p>
                <p className="text-sm text-white/70 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────── */}
      <section className="px-4 py-20 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              Témoignages
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-textDark">
              Ils ont transformé leur quotidien
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-card transition-all"
              >
                <div className="flex mb-3 text-yellow-400">{"★★★★★"}</div>
                <p className="text-sm text-textDark leading-relaxed mb-4 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-textDark">
                      {t.name}
                    </p>
                    <p className="text-xs text-textLight">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────── */}
      <section id="pricing" className="px-4 py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              Tarifs
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-textDark mb-3">
              Simple et transparent
            </h2>
            <p className="text-textLight">
              Commence gratuitement. Passe Premium quand tu es prêt.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 relative ${
                  plan.highlight
                    ? "bg-gradient-to-br from-primary to-accent text-white shadow-card scale-105"
                    : "bg-gray-50 border border-gray-100"
                }`}
              >
                {plan.badge && (
                  <div
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full shadow whitespace-nowrap ${plan.highlight ? "bg-warning text-white" : "bg-danger/10 text-danger border border-danger/20"}`}
                  >
                    {plan.badge}
                  </div>
                )}
                <p
                  className={`text-sm font-semibold uppercase tracking-wide mb-2 ${plan.highlight ? "text-white/70" : "text-textLight"}`}
                >
                  {plan.name}
                </p>
                <div className="flex items-end gap-1 mb-1">
                  <span
                    className={`text-4xl font-extrabold ${plan.highlight ? "text-white" : "text-textDark"}`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-sm mb-1 ${plan.highlight ? "text-white/60" : "text-textLight"}`}
                  >
                    {plan.period}
                  </span>
                </div>
                {"oldPrice" in plan && plan.oldPrice && (
                  <p className="text-xs line-through text-textLight mb-3">
                    {plan.oldPrice} / an
                  </p>
                )}
                <ul className="space-y-2 mb-6 mt-4">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className={`flex items-start gap-2 text-sm ${plan.highlight ? "text-white/90" : "text-textDark"}`}
                    >
                      <span
                        className={`font-bold flex-shrink-0 mt-0.5 ${plan.highlight ? "text-white" : "text-success"}`}
                      >
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block text-center py-3 rounded-xl font-semibold text-sm transition ${
                    plan.highlight
                      ? "bg-white text-primary hover:bg-white/90"
                      : "bg-primary text-white hover:bg-primary/90"
                  }`}
                >
                  {plan.name === "Gratuit"
                    ? "Commencer gratuitement"
                    : "Choisir ce plan"}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-textLight mt-8">
            ✓ Aucune carte requise pour le plan gratuit · ✓ Annulation à tout
            moment · ✓ Données sécurisées
          </p>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <FAQSection />

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-gray-100 px-4 py-8 text-xs text-textLight">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span>🌀</span>
              <span className="font-semibold text-primary">Quotidia</span>
              <span>— Ton quotidien, en mieux.</span>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#features" className="hover:text-textDark transition">
                Fonctionnalités
              </a>
              <a href="#pricing" className="hover:text-textDark transition">
                Tarifs
              </a>
              <Link href="/contact" className="hover:text-textDark transition">
                Contact
              </Link>
              <Link
                href="/legal/mentions-legales"
                className="hover:text-textDark transition"
              >
                Mentions légales
              </Link>
              <Link
                href="/legal/confidentialite"
                className="hover:text-textDark transition"
              >
                Confidentialité
              </Link>
              <Link
                href="/legal/cgu"
                className="hover:text-textDark transition"
              >
                CGU / CGV
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/quotidia"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:text-textDark transition"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://x.com/quotidia"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="hover:text-textDark transition"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://facebook.com/quotidia"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="hover:text-textDark transition"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>
          <p className="text-center w-full">
            © {new Date().getFullYear()} Quotidia. Tous droits réservés.
          </p>
        </div>
      </footer>
      <PWAInstallModal />
    </main>
  );
}
