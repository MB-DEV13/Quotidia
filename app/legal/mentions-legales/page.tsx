import Link from "next/link";

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-8">
          ← Retour à l&apos;accueil
        </Link>

        <h1 className="text-3xl font-extrabold text-textDark mb-2">Mentions légales</h1>
        <p className="text-textLight text-sm mb-10">Dernière mise à jour : mars 2025</p>

        <div className="space-y-8 text-sm text-textDark leading-relaxed">

          <section>
            <h2 className="text-lg font-bold mb-3">1. Éditeur du site</h2>
            <p>Le site Quotidia (accessible à l&apos;adresse <strong>quotidia.app</strong>) est édité par :</p>
            <ul className="mt-3 space-y-1 text-textLight pl-4 border-l-2 border-gray-100">
              <li><strong className="text-textDark">Raison sociale :</strong> [À compléter — nom ou entreprise]</li>
              <li><strong className="text-textDark">Adresse :</strong> [À compléter]</li>
              <li><strong className="text-textDark">Email :</strong> contact@quotidia.app</li>
              <li><strong className="text-textDark">Directeur de la publication :</strong> [À compléter]</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">2. Hébergement</h2>
            <p>Le site est hébergé par :</p>
            <ul className="mt-3 space-y-1 text-textLight pl-4 border-l-2 border-gray-100">
              <li><strong className="text-textDark">Vercel Inc.</strong> — 340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis</li>
              <li><strong className="text-textDark">Supabase Inc.</strong> — 970 Toa Payoh North, Singapour (base de données)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">3. Propriété intellectuelle</h2>
            <p>
              L&apos;ensemble du contenu du site Quotidia (textes, images, logos, interface, code) est la propriété exclusive de l&apos;éditeur et est protégé par les lois françaises et internationales sur la propriété intellectuelle. Toute reproduction, même partielle, est interdite sans autorisation préalable.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">4. Responsabilité</h2>
            <p>
              L&apos;éditeur ne saurait être tenu responsable des dommages directs ou indirects résultant de l&apos;utilisation du site ou de l&apos;impossibilité d&apos;y accéder. Les informations présentes sur le site sont fournies à titre indicatif.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">5. Droit applicable</h2>
            <p>
              Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">6. Contact</h2>
            <p>Pour toute question, contactez-nous à : <a href="mailto:contact@quotidia.app" className="text-primary hover:underline">contact@quotidia.app</a></p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-textLight">
          <Link href="/legal/confidentialite" className="hover:text-primary transition">Politique de confidentialité</Link>
          <Link href="/legal/cgu" className="hover:text-primary transition">CGU / CGV</Link>
        </div>
      </div>
    </main>
  );
}
