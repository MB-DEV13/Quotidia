"use client";

import { useState } from "react";
import { ProfileEditor } from "./ProfileEditor";
import { SettingsSubscription } from "./SettingsSubscription";
import { SignOutButton } from "./SignOutButton";
import { ExportButton } from "./ExportButton";
import { PdfBilanButton } from "./PdfBilanButton";
import { PasswordChangeForm } from "./PasswordChangeForm";
import { DeleteAccountSection } from "./DeleteAccountSection";
import { DailyReminderToggle } from "./DailyReminderToggle";
import { PushNotificationToggle } from "./PushNotificationToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { BadgesByCategory } from "@/components/badges/BadgesByCategory";
import { getXpProgressForCurrentLevel, getLevelTitle } from "@/lib/gamification";
import { ContactForm } from "@/components/contact/ContactForm";

interface BadgeItem {
  name: string;
  description: string;
  icon: string;
  condition: string;
  xpReward: number;
  earned: boolean;
  earnedAt: string | null;
}

interface SettingsTabsProps {
  user: {
    name: string | null;
    email: string;
    avatar: string | null;
    level: number;
    xp: number;
    isPremium: boolean;
    createdAt: string;
    aiRequestsUsed: number;
    stripeCurrentPeriodEnd: string | null;
    country: string | null;
    region: string | null;
    city: string | null;
    showInLeaderboard: boolean;
    loginStreak: number;
    hasPassword: boolean;
    dailyReminderEnabled: boolean;
    budgetMode: string;
  };
  badges: BadgeItem[];
  bankConnection: {
    status: string;
    bankName: string | null;
    lastSyncAt: string | null;
  } | null;
}

const TABS = [
  { id: "info", label: "Mes informations", icon: "👤" },
  { id: "progression", label: "Ma progression", icon: "🏆" },
  { id: "stats", label: "Export & bilan", icon: "📊" },
  { id: "contact", label: "Contact", icon: "✉️" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function SettingsTabs({ user, badges, bankConnection }: SettingsTabsProps) {
  const [tab, setTab] = useState<TabId>("info");
  const xpProgress = getXpProgressForCurrentLevel(user.xp);
  const levelTitle = getLevelTitle(user.level);
  const aiRemaining = user.isPremium ? null : Math.max(0, 5 - user.aiRequestsUsed);

  return (
    <div>
      {/* Tab header */}
      <div className="flex gap-1 bg-white rounded-2xl shadow-soft p-1.5 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              tab === t.id
                ? "bg-primary text-white shadow-card"
                : "text-textLight hover:text-textDark hover:bg-gray-50"
            }`}
          >
            <span>{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
            <span className="sm:hidden text-[10px] leading-tight text-center">
              {t.label.replace("Mes ", "").replace("Ma ", "").replace("Export & ", "")}
            </span>
          </button>
        ))}
      </div>

      {/* ── Onglet 1 : Mes informations ─────────────────────── */}
      {tab === "info" && (
        <div className="space-y-4">
          {/* Abonnement */}
          <SettingsSubscription
            isPremium={user.isPremium}
            aiRemaining={aiRemaining}
            stripeCurrentPeriodEnd={user.stripeCurrentPeriodEnd}
            budgetMode={user.budgetMode}
            bankConnection={bankConnection}
          />

          {/* Profil */}
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="text-sm font-semibold text-textLight uppercase tracking-wide mb-1">Profil</h2>
            <p className="text-xs text-textLight mb-4">
              {user.email} · Membre depuis{" "}
              {new Date(user.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
            </p>
            <ProfileEditor
              name={user.name}
              avatar={user.avatar}
              country={user.country}
              region={user.region}
              city={user.city}
              showInLeaderboard={user.showInLeaderboard}
            />
          </div>

          {/* Sécurité */}
          <div className="bg-white rounded-2xl shadow-soft p-6 space-y-5">
            <h2 className="text-sm font-semibold text-textLight uppercase tracking-wide">Sécurité</h2>

            {user.hasPassword ? (
              <PasswordChangeForm />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-textDark">Connexion Google</p>
                  <p className="text-xs text-textLight mt-0.5">Pas de mot de passe — tu te connectes via Google</p>
                </div>
                <span className="text-xl">🔒</span>
              </div>
            )}
          </div>

          {/* Apparence & notifications */}
          <div className="bg-white rounded-2xl shadow-soft p-6 space-y-4">
            <h2 className="text-sm font-semibold text-textLight uppercase tracking-wide">Préférences</h2>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-textDark">Thème</p>
                <p className="text-xs text-textLight mt-0.5">Bascule entre le mode clair et sombre</p>
              </div>
              <ThemeToggle />
            </div>

            <div className="border-t border-gray-100" />

            <DailyReminderToggle
              enabled={user.dailyReminderEnabled}
              isPremium={user.isPremium}
            />

            <div className="border-t border-gray-100" />

            <PushNotificationToggle />
          </div>

          {/* Infos compte */}
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="text-sm font-semibold text-textLight uppercase tracking-wide mb-4">Compte</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-textLight">Email</span>
                <span className="text-textDark font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textLight">Membre depuis</span>
                <span className="text-textDark font-medium">
                  {new Date(user.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-textLight">Plan</span>
                <span className={`font-semibold ${user.isPremium ? "text-accent" : "text-textLight"}`}>
                  {user.isPremium ? "✨ Premium" : "Gratuit"}
                </span>
              </div>
            </div>
          </div>

          {/* Zone de danger */}
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="text-sm font-semibold text-textLight uppercase tracking-wide mb-4">Suppression du compte</h2>
            <p className="text-xs text-textLight mb-4">
              La suppression de ton compte est permanente et irréversible. Toutes tes données seront effacées conformément au RGPD.
            </p>
            <DeleteAccountSection />
          </div>

          {/* Déconnexion mobile */}
          <div className="md:hidden bg-white rounded-2xl shadow-soft p-2">
            <SignOutButton />
          </div>
        </div>
      )}

      {/* ── Onglet 2 : Ma progression ───────────────────────── */}
      {tab === "progression" && (
        <div className="space-y-4">
          {/* Niveau & XP */}
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="text-sm font-semibold text-textLight uppercase tracking-wide mb-4">Niveau & XP</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-extrabold text-primary">{user.level}</span>
              </div>
              <div>
                <p className="font-bold text-textDark">{levelTitle}</p>
                <p className="text-xs text-textLight">{user.xp} XP total</p>
              </div>
            </div>
            <div className="mb-1 flex justify-between text-xs text-textLight">
              <span>Niveau {user.level}</span>
              <span>{xpProgress.current} / {xpProgress.needed} XP</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                style={{ width: `${xpProgress.percentage}%` }}
              />
            </div>
            <p className="text-xs text-textLight mt-1.5 text-right">
              {xpProgress.percentage}% vers le niveau {user.level + 1}
            </p>

            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-3">
              <span className="text-2xl">📅</span>
              <div>
                <p className="text-sm font-semibold text-textDark">Streak connexion</p>
                <p className="text-xs text-textLight">
                  {user.loginStreak} semaine{user.loginStreak > 1 ? "s" : ""} consécutive{user.loginStreak > 1 ? "s" : ""} · +30 XP/semaine
                </p>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="text-sm font-semibold text-textLight uppercase tracking-wide mb-4">
              Badges — {badges.filter((b) => b.earned).length}/{badges.length} débloqués
            </h2>
            <BadgesByCategory badges={badges} />
          </div>
        </div>
      )}

      {/* ── Onglet 4 : Contact ───────────────────────────── */}
      {tab === "contact" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="text-sm font-semibold text-textLight uppercase tracking-wide mb-1">
              Nous contacter
            </h2>
            <p className="text-xs text-textLight mb-5">
              Une question, un bug ou une suggestion ? On te répond sous 24-48h.
            </p>
            <ContactForm userName={user.name} userEmail={user.email} />
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-5 text-center">
            <p className="text-sm font-semibold text-textDark mb-1">Suis-nous sur les réseaux</p>
            <p className="text-xs text-textLight mb-4">Actualités, conseils et nouveautés Quotidia.</p>
            <div className="flex items-center justify-center gap-3">
              <a href="https://instagram.com/quotidia" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 text-purple-600 hover:from-purple-500/20 hover:to-pink-500/20 transition text-sm font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </a>
              <a href="https://x.com/quotidia" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition text-sm font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                X / Twitter
              </a>
              <a href="https://facebook.com/quotidia" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition text-sm font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Onglet 3 : Export & bilan ─────────────────────── */}
      {tab === "stats" && (
        <div className="space-y-4">
          {/* Bilan PDF */}
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="text-sm font-semibold text-textLight uppercase tracking-wide mb-1">Bilan</h2>
            <p className="text-xs text-textLight mb-4">
              Génère un rapport complet de tes habitudes, budget et objectifs au format PDF.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PdfBilanButton type="weekly" isPremium={user.isPremium} />
              <PdfBilanButton type="monthly" isPremium={user.isPremium} />
            </div>
          </div>

          {/* Export CSV */}
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="text-sm font-semibold text-textLight uppercase tracking-wide mb-1">Export de données</h2>
            <p className="text-xs text-textLight mb-4">
              Télécharge toutes tes habitudes, dépenses et objectifs au format CSV.
            </p>
            <ExportButton isPremium={user.isPremium} />
          </div>
        </div>
      )}
    </div>
  );
}
