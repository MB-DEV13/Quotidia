"use client";

import Link from "next/link";

export function BankConnectionBanner() {
  return (
    <div className="mb-6 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl px-4 py-3.5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="flex items-center gap-3 flex-1">
        <span className="text-2xl shrink-0">🏦</span>
        <div>
          <p className="text-sm font-semibold text-textDark">
            Connecte ta banque et oublie la saisie manuelle
          </p>
          <p className="text-xs text-textLight mt-0.5">
            Avec Premium, tes dépenses et revenus se synchronisent automatiquement depuis ton compte bancaire.
          </p>
        </div>
      </div>
      <Link
        href="/settings?tab=subscription"
        className="shrink-0 bg-gradient-to-r from-primary to-accent text-white text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition whitespace-nowrap"
      >
        Passer Premium →
      </Link>
    </div>
  );
}
