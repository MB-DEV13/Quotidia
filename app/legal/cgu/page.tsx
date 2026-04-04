import Link from "next/link";

export default function CguPage() {
  return (
    <main className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-8">
          ← Retour à l&apos;accueil
        </Link>

        <h1 className="text-3xl font-extrabold text-textDark mb-2">Conditions Générales d&apos;Utilisation et de Vente</h1>
        <p className="text-textLight text-sm mb-10">Dernière mise à jour : mars 2025</p>

        <div className="space-y-8 text-sm text-textDark leading-relaxed">

          <section>
            <h2 className="text-lg font-bold mb-3">1. Objet</h2>
            <p>
              Les présentes conditions générales régissent l&apos;utilisation du service Quotidia, accessible à <strong>quotidia.app</strong>, ainsi que la souscription à l&apos;abonnement Premium. En créant un compte, vous acceptez l&apos;intégralité des présentes conditions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">2. Description du service</h2>
            <p className="mb-2">Quotidia est un dashboard de vie personnel qui propose :</p>
            <ul className="space-y-1 text-textLight pl-4 border-l-2 border-gray-100">
              <li>Suivi d&apos;habitudes avec système de streaks et gamification</li>
              <li>Gestion de budget et dépenses</li>
              <li>Suivi d&apos;objectifs personnels</li>
              <li>Assistant IA conversationnel (GPT-4o-mini)</li>
              <li>Tableau de bord unifié</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">3. Compte utilisateur</h2>
            <p>
              L&apos;inscription est gratuite. Vous êtes responsable de la confidentialité de vos identifiants. Tout accès via votre compte est réputé effectué par vous. Quotidia se réserve le droit de suspendre tout compte en cas de comportement abusif, fraude ou violation des présentes conditions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">4. Plan gratuit</h2>
            <p className="mb-2">Le plan gratuit inclut, dans les limites suivantes :</p>
            <ul className="space-y-1 text-textLight pl-4 border-l-2 border-gray-100">
              <li>3 habitudes actives simultanément</li>
              <li>2 objectifs actifs simultanément</li>
              <li>2 catégories de dépenses par mois</li>
              <li>5 requêtes IA par mois</li>
              <li>Statistiques sur 7 jours</li>
            </ul>
            <p className="mt-3 text-textLight">Ces limites peuvent évoluer. Tout changement sera communiqué avec un préavis de 30 jours.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">5. Abonnement Premium</h2>
            <p className="mb-3">
              L&apos;abonnement Premium est proposé à <strong>4,99€/mois</strong> (TTC) ou <strong>39,99€/an</strong> (TTC), via Stripe.
            </p>
            <h3 className="font-semibold mb-2 text-textDark">5.1 Paiement</h3>
            <p className="text-textLight mb-3">
              Le paiement est prélevé au début de chaque période (mensuelle ou annuelle). Les données bancaires sont traitées exclusivement par Stripe et ne sont jamais stockées sur nos serveurs.
            </p>
            <h3 className="font-semibold mb-2 text-textDark">5.2 Annulation</h3>
            <p className="text-textLight mb-3">
              Vous pouvez annuler à tout moment depuis vos paramètres. L&apos;annulation prend effet à la fin de la période en cours. Aucun remboursement partiel n&apos;est effectué pour la période restante, sauf obligation légale.
            </p>
            <h3 className="font-semibold mb-2 text-textDark">5.3 Droit de rétractation</h3>
            <p className="text-textLight">
              Conformément à l&apos;article L221-28 du Code de la consommation, le droit de rétractation de 14 jours ne s&apos;applique pas aux services numériques dont l&apos;exécution a commencé avec votre accord avant l&apos;expiration du délai. Si vous souhaitez exercer ce droit avant toute utilisation, contactez-nous à <a href="mailto:contact@quotidia.app" className="text-primary hover:underline">contact@quotidia.app</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">6. Disponibilité du service</h2>
            <p>
              Quotidia s&apos;efforce d&apos;assurer une disponibilité maximale du service. Des interruptions peuvent survenir pour maintenance ou raisons techniques. Aucune indemnisation ne sera due pour les interruptions de service inférieures à 72 heures consécutives.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">7. Données utilisateur</h2>
            <p>
              Vous restez propriétaire de vos données. Vous pouvez les exporter (Premium) ou supprimer votre compte à tout moment. En cas de fermeture de Quotidia, vous serez informé 30 jours à l&apos;avance pour récupérer vos données.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">8. Utilisation acceptable</h2>
            <p className="mb-2">Il est interdit d&apos;utiliser Quotidia pour :</p>
            <ul className="space-y-1 text-textLight pl-4 border-l-2 border-gray-100">
              <li>Tout usage illégal ou frauduleux</li>
              <li>Tenter d&apos;accéder aux données d&apos;autres utilisateurs</li>
              <li>Surcharger intentionnellement les serveurs</li>
              <li>Partager des contenus illicites via l&apos;assistant IA</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">9. Limitation de responsabilité</h2>
            <p>
              Quotidia est un outil d&apos;aide à l&apos;organisation personnelle. Les conseils de l&apos;assistant IA sont fournis à titre indicatif et ne constituent pas un avis médical, financier ou juridique professionnel. La responsabilité de Quotidia ne saurait excéder le montant des sommes versées au cours des 3 derniers mois.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">10. Modification des CGU</h2>
            <p>
              Ces conditions peuvent être modifiées. Tout changement significatif sera notifié par email avec un préavis de 30 jours. La poursuite de l&apos;utilisation du service vaut acceptation des nouvelles conditions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">11. Droit applicable — Médiation</h2>
            <p>
              Les présentes CGU sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en priorité via <a href="mailto:contact@quotidia.app" className="text-primary hover:underline">contact@quotidia.app</a>. À défaut, vous pouvez recourir à la médiation de la consommation conformément à la directive européenne 2013/11/UE.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-textLight">
          <Link href="/legal/mentions-legales" className="hover:text-primary transition">Mentions légales</Link>
          <Link href="/legal/confidentialite" className="hover:text-primary transition">Politique de confidentialité</Link>
        </div>
      </div>
    </main>
  );
}
