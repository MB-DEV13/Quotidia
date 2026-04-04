import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Glow décoratif */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-primary/15 to-accent/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative text-center max-w-md">
        {/* Numéro 404 */}
        <div className="relative mb-6 select-none">
          <span className="text-[120px] md:text-[160px] font-extrabold leading-none bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent opacity-20">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl">🌀</span>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-textDark mb-3">
          Page introuvable
        </h1>
        <p className="text-textLight text-sm md:text-base leading-relaxed mb-8">
          Cette page n&apos;existe pas ou a été déplacée.<br />
          Retourne au dashboard pour continuer ta progression.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="bg-gradient-to-r from-primary to-accent text-white font-semibold px-6 py-3 rounded-2xl shadow-card hover:opacity-90 transition text-sm"
          >
            → Mon dashboard
          </Link>
          <Link
            href="/"
            className="bg-white border border-gray-200 text-textLight font-medium px-6 py-3 rounded-2xl hover:bg-gray-50 transition text-sm"
          >
            Accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
