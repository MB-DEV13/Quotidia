import { FAQSection } from "@/components/landing/FAQSection";
import { InteractiveMockup } from "@/components/landing/InteractiveMockupLazy";
import { LandingNav } from "@/components/landing/LandingNav";
import { PWAInstallModal } from "@/components/ui/PWAInstallModal";
import { config } from "@/lib/config";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export const metadata: Metadata = {
  title: `${config.app.name} — ${config.app.tagline}`,
  description:
    "Suis tes habitudes, gère ton budget, atteins tes objectifs et booste ta productivité avec un assistant IA personnel. Gratuit pour commencer.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: "/",
  },
};

const FEATURE_STYLES = [
  { icon: "✅", color: "from-violet-500/10 to-primary/10", iconBg: "bg-primary/10 text-primary" },
  { icon: "💰", color: "from-emerald-500/10 to-green-400/10", iconBg: "bg-emerald-500/10 text-emerald-600" },
  { icon: "🎯", color: "from-orange-400/10 to-yellow-300/10", iconBg: "bg-orange-400/10 text-orange-500" },
  { icon: "🤖", color: "from-sky-400/10 to-blue-400/10", iconBg: "bg-sky-400/10 text-sky-500" },
  { icon: "🏆", color: "from-yellow-400/10 to-amber-300/10", iconBg: "bg-yellow-400/10 text-yellow-600" },
  { icon: "📊", color: "from-purple-500/10 to-accent/10", iconBg: "bg-accent/10 text-accent" },
];

const COMPARISON_BOOLEANS = [
  { quotidia: true, notion: false, habitica: true, ynab: false },
  { quotidia: true, notion: false, habitica: false, ynab: true },
  { quotidia: true, notion: false, habitica: false, ynab: true },
  { quotidia: true, notion: true, habitica: false, ynab: false },
  { quotidia: true, notion: false, habitica: false, ynab: false },
  { quotidia: true, notion: false, habitica: true, ynab: false },
  { quotidia: true, notion: false, habitica: true, ynab: false },
  { quotidia: true, notion: false, habitica: false, ynab: false },
];

const STEP_METAS = [
  { num: "01", icon: "🚀" },
  { num: "02", icon: "⚙️" },
  { num: "03", icon: "📈" },
];

const TESTIMONIAL_AVATARS = ["👩‍🏫", "👨‍💻", "👩‍🎓"];

export default async function LandingPage() {
  const t = await getTranslations("landing");

  const featureTexts = t.raw("features.items") as Array<{ title: string; desc: string }>;
  const FEATURES = FEATURE_STYLES.map((s, i) => ({ ...s, ...featureTexts[i] }));

  const comparisonFeatures = t.raw("comparison.features") as string[];
  const COMPARISON = COMPARISON_BOOLEANS.map((b, i) => ({ feature: comparisonFeatures[i], ...b }));

  const stepTexts = t.raw("how.steps") as Array<{ title: string; desc: string }>;
  const STEPS = STEP_METAS.map((m, i) => ({ ...m, ...stepTexts[i] }));

  const testimonialItems = t.raw("testimonials.items") as Array<{ quote: string; name: string; role: string }>;
  const TESTIMONIALS = testimonialItems.map((item, i) => ({ ...item, avatar: TESTIMONIAL_AVATARS[i] }));

  const pricingPlans = t.raw("pricing.plans") as Array<{
    name: string;
    price: string;
    period: string;
    features: string[];
    badge?: string;
    oldPrice?: string;
    highlight?: boolean;
  }>;
  const PRICING = pricingPlans.map((plan, i) => ({ ...plan, highlight: i === 1 }));

  const statsItems = t.raw("stats.items") as Array<{ value: string; label: string }>;
  const aiBullets = t.raw("ai.bullets") as string[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: config.app.name,
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
    url: config.app.url,
    inLanguage: "fr",
  };

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
            {t("hero.titleStart")}{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t("hero.titleHighlight")}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-textLight max-w-2xl mx-auto mb-10 leading-relaxed">
            {t("hero.description", { appName: config.app.name })}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/register"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-card text-base"
            >
              {t("hero.ctaPrimary")}
            </Link>
            <a
              href="#how"
              className="bg-white hover:bg-gray-50 text-primary font-semibold px-8 py-4 rounded-2xl border border-primary/20 transition-all shadow-soft text-base"
            >
              {t("hero.ctaSecondary")}
            </a>
          </div>

        </div>
      </section>

      {/* ── Dashboard mockup interactif ───────────────────────────── */}
      <section className="px-4 pb-12">
        <div className="max-w-lg mx-auto">
          <p className="text-center text-xs font-semibold text-textLight uppercase tracking-widest mb-4">
            {t("mockup.label")}
          </p>
          <InteractiveMockup />
        </div>
      </section>

      {/* ── Comment ça marche ─────────────────────────────────────── */}
      <section id="how" className="px-4 py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              {t("how.badge")}
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-textDark mb-3">
              {t("how.title")}
            </h2>
            <p className="text-textLight">
              {t("how.subtitle")}
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
              {t("how.cta")}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section id="features" className="px-4 py-20 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              {t("features.badge")}
            </p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-textDark mb-4">
              {t("features.title")}
            </h2>
            <p className="text-textLight text-lg max-w-xl mx-auto">
              {t("features.subtitle")}
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
                🤖 {t("ai.badge")}
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-textDark mb-5 leading-tight">
                {t("ai.title")}
              </h2>
              <p className="text-textLight leading-relaxed mb-6">
                {t("ai.description")}
              </p>
              <ul className="space-y-3 mb-8">
                {aiBullets.map((item) => (
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
                {t("ai.cta")}
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
                    {config.app.name} Coach
                  </p>
                  <p className="text-xs text-sky-500">{t("ai.online")}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-sky-50 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                  <p className="text-xs text-textDark leading-relaxed">
                    {t("ai.chatMsg1")}
                  </p>
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] ml-auto">
                  <p className="text-xs text-textDark">
                    {t("ai.chatMsg2")}
                  </p>
                </div>
                <div className="bg-sky-50 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                  <p className="text-xs text-textDark leading-relaxed">
                    {t("ai.chatMsg3")}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                <input
                  className="flex-1 text-xs bg-transparent outline-none text-textLight"
                  placeholder={t("ai.chatPlaceholder")}
                  readOnly
                />
                <button
                  aria-label={t("ai.sendLabel")}
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
              {t("comparison.badge", { appName: config.app.name })}
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-textDark mb-3">
              {t("comparison.title")}
            </h2>
            <p className="text-textLight">
              {t("comparison.subtitle", { appName: config.app.name })}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left text-sm font-semibold text-textLight pb-4 pr-4">
                    {t("comparison.featureCol")}
                  </th>
                  <th className="text-center pb-4 px-3">
                    <div className="inline-flex flex-col items-center gap-1">
                      <span className="text-lg">🌀</span>
                      <span className="text-xs font-bold text-primary">
                        {config.app.name}
                      </span>
                    </div>
                  </th>
                  <th className="text-center pb-4 px-3">
                    <div className="inline-flex flex-col items-center gap-1">
                      <span className="text-lg">📝</span>
                      <span className="text-xs font-medium text-textLight">
                        {t("comparison.todoApp")}
                      </span>
                    </div>
                  </th>
                  <th className="text-center pb-4 px-3">
                    <div className="inline-flex flex-col items-center gap-1">
                      <span className="text-lg">✅</span>
                      <span className="text-xs font-medium text-textLight">
                        {t("comparison.habitApp")}
                      </span>
                    </div>
                  </th>
                  <th className="text-center pb-4 px-3">
                    <div className="inline-flex flex-col items-center gap-1">
                      <span className="text-lg">💳</span>
                      <span className="text-xs font-medium text-textLight">
                        {t("comparison.budgetApp")}
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
            {t("comparison.footer", { appName: config.app.name })}
          </p>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <section className="px-4 py-20 bg-gradient-to-br from-primary to-accent text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-12">
            {t("stats.title")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {statsItems.map((s) => (
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
              {t("testimonials.badge")}
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-textDark">
              {t("testimonials.title")}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial) => (
              <div
                key={testimonial.name}
                className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-card transition-all"
              >
                <div className="flex mb-3 text-yellow-400">{"★★★★★"}</div>
                <p className="text-sm text-textDark leading-relaxed mb-4 italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-textDark">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-textLight">{testimonial.role}</p>
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
              {t("pricing.badge")}
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-textDark mb-3">
              {t("pricing.title")}
            </h2>
            <p className="text-textLight">
              {t("pricing.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {PRICING.map((plan, index) => (
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
                {plan.oldPrice && (
                  <p className="text-xs line-through text-textLight mb-3">
                    {plan.oldPrice} {t("pricing.oldPriceLabel")}
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
                  {index === 0
                    ? t("pricing.ctaFree")
                    : t("pricing.ctaPaid")}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-textLight mt-8">
            {t("pricing.footer")}
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
              <span className="font-semibold text-primary">{config.app.name}</span>
              <span>— {config.app.tagline}</span>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#features" className="hover:text-textDark transition">
                {t("footer.features")}
              </a>
              <a href="#pricing" className="hover:text-textDark transition">
                {t("footer.pricing")}
              </a>
              <Link href="/contact" className="hover:text-textDark transition">
                {t("footer.contact")}
              </Link>
              <Link
                href="/legal/mentions-legales"
                className="hover:text-textDark transition"
              >
                {t("footer.legal")}
              </Link>
              <Link
                href="/legal/confidentialite"
                className="hover:text-textDark transition"
              >
                {t("footer.privacy")}
              </Link>
              <Link
                href="/legal/cgu"
                className="hover:text-textDark transition"
              >
                {t("footer.terms")}
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={config.social.instagram}
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
                href={config.social.twitter}
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
                href={config.social.facebook}
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
            {t("footer.copyright", { year: new Date().getFullYear(), appName: config.app.name })}{" "}
            <a
              href="https://devlyn.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Devlyn
            </a>
          </p>
        </div>
      </footer>
      <PWAInstallModal />
    </main>
  );
}
