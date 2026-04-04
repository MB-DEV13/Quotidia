"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BudgetSetupModalProps {
  isOpen: boolean;
  onComplete: (config: { monthlyBudget: number; incomeAmount: number; incomePeriod: number; incomeLabel: string }) => Promise<void>;
}

export function BudgetSetupModal({ isOpen, onComplete }: BudgetSetupModalProps) {
  const [step, setStep] = useState(0);
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomePeriod, setIncomePeriod] = useState("30");
  const [incomeLabel, setIncomeLabel] = useState("Salaire");
  const [loading, setLoading] = useState(false);

  const PRESET_PERIODS = [
    { label: "Hebdo", days: 7 },
    { label: "Bi-mensuel", days: 15 },
    { label: "Mensuel", days: 30 },
    { label: "Personnalisé", days: 0 },
  ];

  const [selectedPeriod, setSelectedPeriod] = useState(2); // mensuel par défaut

  function handlePeriodSelect(idx: number, days: number) {
    setSelectedPeriod(idx);
    if (days > 0) setIncomePeriod(String(days));
  }

  async function handleFinish() {
    const budget = parseFloat(monthlyBudget);
    const income = parseFloat(incomeAmount);
    const period = parseInt(incomePeriod);
    if (isNaN(income) || income < 0 || isNaN(period) || period < 1) return;
    setLoading(true);
    await onComplete({
      monthlyBudget: isNaN(budget) ? 0 : budget,
      incomeAmount: income,
      incomePeriod: period,
      incomeLabel: incomeLabel.trim() || "Revenu",
    });
    setLoading(false);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl w-full max-w-md p-6 shadow-card"
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">
                💰
              </div>
              <h2 className="text-xl font-bold text-textDark">Configure ton budget</h2>
              <p className="text-sm text-textLight mt-1">Quelques infos pour personnaliser ton suivi</p>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-6">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${step === i ? "w-6 bg-primary" : "w-2 bg-gray-200"}`}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -30, opacity: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-semibold text-textDark mb-1">
                      Ton revenu récurrent
                    </label>
                    <p className="text-xs text-textLight mb-3">Salaire, pension, revenu principal...</p>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={incomeAmount}
                      onChange={(e) => setIncomeAmount(e.target.value)}
                      placeholder="ex: 1 800"
                      autoFocus
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-textDark mb-1">
                      Libellé <span className="text-textLight font-normal">(optionnel)</span>
                    </label>
                    <input
                      type="text"
                      value={incomeLabel}
                      onChange={(e) => setIncomeLabel(e.target.value)}
                      placeholder="ex: Salaire, Retraite..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-textDark mb-2">Fréquence de versement</label>
                    <div className="grid grid-cols-4 gap-2">
                      {PRESET_PERIODS.map((p, i) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => handlePeriodSelect(i, p.days)}
                          className={`py-2.5 rounded-xl text-xs font-medium transition ${
                            selectedPeriod === i ? "bg-primary text-white" : "bg-gray-50 text-textDark hover:bg-gray-100"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                    {selectedPeriod === 3 && (
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-sm text-textLight">Tous les</span>
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={incomePeriod}
                          onChange={(e) => setIncomePeriod(e.target.value)}
                          className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-textLight">jours</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setStep(1)}
                    disabled={!incomeAmount && selectedPeriod !== 3}
                    className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold text-sm transition mt-2 disabled:opacity-60"
                  >
                    Suivant →
                  </button>
                  <button onClick={() => setStep(1)} className="w-full text-center text-xs text-textLight hover:text-textDark transition">
                    Passer cette étape
                  </button>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -30, opacity: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-semibold text-textDark mb-1">
                      Plafond de dépenses mensuel
                    </label>
                    <p className="text-xs text-textLight mb-3">
                      On t&apos;alertera quand tu t&apos;en approches. Laisse vide pour utiliser ton revenu comme référence.
                    </p>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={monthlyBudget}
                      onChange={(e) => setMonthlyBudget(e.target.value)}
                      placeholder={incomeAmount ? `ex: ${Math.round(parseFloat(incomeAmount) * 0.8)}` : "ex: 1 500"}
                      autoFocus
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                    />
                    {incomeAmount && (
                      <p className="text-xs text-textLight mt-2">
                        💡 Ton revenu : {parseFloat(incomeAmount).toFixed(0)} € — laisse vide pour le prendre comme plafond
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setStep(0)}
                      className="flex-1 py-3 border border-gray-200 text-sm font-medium text-textLight rounded-xl hover:bg-gray-50 transition"
                    >
                      ← Retour
                    </button>
                    <button
                      onClick={handleFinish}
                      disabled={loading}
                      className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold text-sm transition disabled:opacity-60"
                    >
                      {loading ? "Enregistrement..." : "C'est parti ! 🚀"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
