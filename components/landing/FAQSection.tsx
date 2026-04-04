"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Mes données sont-elles privées et sécurisées ?",
    a: "Oui. Tes données sont hébergées en Europe sur des serveurs sécurisés (Supabase / PostgreSQL). Elles ne sont jamais revendues ni partagées. Tu peux supprimer ton compte et toutes tes données à tout moment depuis les paramètres.",
  },
  {
    q: "Puis-je annuler mon abonnement à tout moment ?",
    a: "Absolument. Aucun engagement, aucune rétention. Tu peux annuler en un clic depuis tes paramètres. Tu gardes l'accès Premium jusqu'à la fin de la période payée.",
  },
  {
    q: "Quelle est la différence entre Gratuit et Premium ?",
    a: "La version gratuite te donne 3 habitudes, 2 objectifs, 2 catégories budget et 5 requêtes IA par mois — largement suffisant pour démarrer. Premium lève toutes ces limites et ajoute les stats avancées, le bilan téléchargeable, l'export CSV et les thèmes.",
  },
  {
    q: "Y a-t-il une application mobile ?",
    a: "Quotidia est une Progressive Web App (PWA) : tu peux l'ajouter à l'écran d'accueil de ton téléphone depuis le navigateur pour une expérience quasi-native. Une app iOS/Android dédiée est dans la roadmap.",
  },
  {
    q: "L'assistant IA est-il vraiment personnalisé ?",
    a: "Oui. L'IA analyse tes habitudes, tes streaks, tes objectifs et ton budget en temps réel pour te donner des conseils adaptés à ta situation — pas des messages génériques. Elle utilise GPT-4o-mini d'OpenAI.",
  },
  {
    q: "Que se passe-t-il si je dépasse la limite gratuite ?",
    a: "Tu reçois un message clair t'indiquant la limite atteinte. Tes données existantes sont préservées, tu peux toujours les consulter. Seule la création de nouvelles entrées est bloquée jusqu'au passage Premium.",
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="px-4 py-20 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-[#5B5EA6] uppercase tracking-widest mb-3">
            FAQ
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            Questions fréquentes
          </h2>
          <p className="text-gray-500">
            Tout ce que tu dois savoir avant de commencer.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden transition-all"
            >
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-sm font-semibold text-gray-800 pr-4">
                  {faq.q}
                </span>
                <span
                  className={`text-[#5B5EA6] text-lg font-bold flex-shrink-0 transition-transform duration-200 ${open === i ? "rotate-45" : ""}`}
                >
                  +
                </span>
              </button>
              {open === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
