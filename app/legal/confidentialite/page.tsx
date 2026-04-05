import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité RGPD de Quotidia — données collectées, cookies et droits des utilisateurs.",
};

export default function ConfidentialitePage() {
  return (
    <main className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-8">
          ← Retour à l&apos;accueil
        </Link>

        <h1 className="text-3xl font-extrabold text-textDark mb-2">Politique de confidentialité</h1>
        <p className="text-textLight text-sm mb-10">Dernière mise à jour : mars 2025 — conforme RGPD</p>

        <div className="space-y-8 text-sm text-textDark leading-relaxed">

          <section>
            <h2 className="text-lg font-bold mb-3">1. Responsable du traitement</h2>
            <p>
              Le responsable du traitement des données personnelles collectées via Quotidia est l&apos;éditeur du site (voir <Link href="/legal/mentions-legales" className="text-primary hover:underline">mentions légales</Link>). Contact : <a href="mailto:contact@quotidia.app" className="text-primary hover:underline">contact@quotidia.app</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">2. Données collectées</h2>
            <p className="mb-3">Nous collectons les données suivantes :</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 border border-gray-100 font-semibold">Donnée</th>
                    <th className="text-left p-3 border border-gray-100 font-semibold">Finalité</th>
                    <th className="text-left p-3 border border-gray-100 font-semibold">Base légale</th>
                  </tr>
                </thead>
                <tbody className="text-textLight">
                  {[
                    ["Email, nom", "Création de compte, authentification", "Contrat"],
                    ["Habitudes, streaks", "Fonctionnement du service", "Contrat"],
                    ["Dépenses, budget", "Fonctionnement du service", "Contrat"],
                    ["Objectifs", "Fonctionnement du service", "Contrat"],
                    ["Données de paiement", "Traitement Stripe (non stockées chez nous)", "Contrat"],
                    ["Conversations IA", "Personnalisation des conseils", "Consentement"],
                    ["Cookies de session", "Authentification sécurisée", "Intérêt légitime"],
                  ].map(([d, f, b]) => (
                    <tr key={d} className="hover:bg-gray-50/50">
                      <td className="p-3 border border-gray-100 font-medium text-textDark">{d}</td>
                      <td className="p-3 border border-gray-100">{f}</td>
                      <td className="p-3 border border-gray-100">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">3. Durée de conservation</h2>
            <p>
              Vos données sont conservées pendant la durée de votre compte actif, puis supprimées dans un délai de <strong>30 jours</strong> suivant la clôture du compte. Les données de facturation sont conservées <strong>10 ans</strong> conformément à l&apos;obligation légale comptable.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">4. Partage des données</h2>
            <p className="mb-2">Vos données ne sont jamais vendues. Elles sont partagées uniquement avec :</p>
            <ul className="space-y-2 text-textLight pl-4 border-l-2 border-gray-100">
              <li><strong className="text-textDark">Supabase</strong> — hébergement base de données (infrastructure sécurisée)</li>
              <li><strong className="text-textDark">Vercel</strong> — hébergement application</li>
              <li><strong className="text-textDark">Stripe</strong> — traitement des paiements (certifié PCI-DSS)</li>
              <li><strong className="text-textDark">OpenAI</strong> — traitement IA des conversations (données pseudonymisées)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">5. Cookies</h2>
            <p className="mb-2">Quotidia utilise :</p>
            <ul className="space-y-2 text-textLight pl-4 border-l-2 border-gray-100">
              <li><strong className="text-textDark">Cookies essentiels</strong> — session d&apos;authentification (NextAuth). Nécessaires au fonctionnement, pas de consentement requis.</li>
              <li><strong className="text-textDark">Cookies de préférence</strong> — thème sombre, langue. Stockés localement.</li>
            </ul>
            <p className="mt-3 text-textLight">Nous n&apos;utilisons pas de cookies publicitaires ni de traceurs tiers.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">6. Vos droits (RGPD)</h2>
            <p className="mb-2">Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="space-y-1.5 text-textLight">
              {[
                "Droit d'accès — obtenir une copie de vos données",
                "Droit de rectification — corriger vos données inexactes",
                "Droit à l'effacement — supprimer votre compte et toutes vos données",
                "Droit à la portabilité — exporter vos données (CSV disponible en Premium)",
                "Droit d'opposition — s'opposer à certains traitements",
              ].map((r) => (
                <li key={r} className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">→</span>
                  {r}
                </li>
              ))}
            </ul>
            <p className="mt-3">
              Pour exercer vos droits : <a href="mailto:contact@quotidia.app" className="text-primary hover:underline">contact@quotidia.app</a>. Vous pouvez également saisir la <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">CNIL</a> en cas de réclamation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">7. Sécurité</h2>
            <p>
              Les données sont chiffrées en transit (HTTPS/TLS) et au repos. Les mots de passe sont hashés avec bcrypt. L&apos;accès aux données est restreint et journalisé.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-textLight">
          <Link href="/legal/mentions-legales" className="hover:text-primary transition">Mentions légales</Link>
          <Link href="/legal/cgu" className="hover:text-primary transition">CGU / CGV</Link>
        </div>
      </div>
    </main>
  );
}
