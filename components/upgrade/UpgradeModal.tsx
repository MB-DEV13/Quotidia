"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

const PREMIUM_PERKS = [
  "Habitudes illimitées",
  "Objectifs illimités",
  "Assistant IA illimité",
  "Badges & niveaux avancés",
  "Export CSV de tes données",
  "Stats avancées (30/90 jours)",
  "Bilan hebdomadaire",
  "Thème sombre",
];

export function UpgradeModal({ isOpen, onClose, reason }: UpgradeModalProps) {
  const router = useRouter();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-card w-full max-w-sm p-6 z-10"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-textLight hover:text-textDark transition text-lg leading-none"
              aria-label="Fermer"
            >
              ✕
            </button>

            {/* Header */}
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">✨</div>
              <h2 className="text-xl font-bold text-textDark">Passe à Premium</h2>
              <p className="text-sm text-textLight mt-1">Débloque toutes les fonctionnalités</p>
            </div>

            {/* Reason highlight */}
            {reason && (
              <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 mb-4 text-sm text-accent font-medium text-center">
                {reason}
              </div>
            )}

            {/* Perks list */}
            <ul className="space-y-2 mb-5">
              {PREMIUM_PERKS.map((perk) => (
                <li key={perk} className="flex items-center gap-2 text-sm text-textDark">
                  <span className="text-success font-bold">✓</span>
                  {perk}
                </li>
              ))}
            </ul>

            {/* Price */}
            <p className="text-center text-sm text-textLight mb-4">
              À partir de <span className="font-bold text-textDark">4,99€/mois</span>
            </p>

            {/* CTA */}
            <button
              onClick={() => {
                onClose();
                router.push("/upgrade");
              }}
              className="w-full bg-gradient-to-r from-primary to-accent text-white font-semibold py-3 rounded-xl transition hover:opacity-90"
            >
              Voir les offres
            </button>

            <button
              onClick={onClose}
              className="w-full mt-2 py-2.5 text-sm text-textLight hover:text-textDark transition"
            >
              Plus tard
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
