"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[APP_ERROR]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F3FF]">
      <div className="text-center max-w-md px-6">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-2xl font-bold text-[#2D2D2D] mb-2">Une erreur est survenue</h1>
        <p className="text-[#888] mb-8">
          Quelque chose s&apos;est mal passé. Réessaie ou contacte le support si le problème persiste.
        </p>
        <button
          onClick={reset}
          className="bg-[#5B5EA6] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#4a4d8f] transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
