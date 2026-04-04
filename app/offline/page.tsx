"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-soft p-10 text-center max-w-sm w-full">
        <p className="text-5xl mb-4">📡</p>
        <h1 className="text-xl font-bold text-textDark mb-2">Pas de connexion</h1>
        <p className="text-sm text-textLight mb-6">
          Quotidia nécessite une connexion internet. Vérifie ton réseau et réessaie.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition text-sm"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
