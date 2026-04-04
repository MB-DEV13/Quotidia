"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "🏠", label: "Accueil" },
  { href: "/habits", icon: "✅", label: "Habitudes" },
  { href: "/budget", icon: "💰", label: "Budget" },
  { href: "/goals", icon: "🎯", label: "Objectifs" },
  { href: "/classement", icon: "🏆", label: "Classement" },
  { href: "/stats", icon: "📊", label: "Stats" },
  { href: "/bilan", icon: "📋", label: "Bilan" },
];

// Items affichés dans la bottom nav mobile (5 premiers)
const MOBILE_MAIN = NAV_ITEMS.slice(0, 5);

// Items dans le sous-menu "Plus"
const MORE_ITEMS = [
  { href: "/stats", icon: "📊", label: "Stats" },
  { href: "/bilan", icon: "📋", label: "Bilan" },
  { href: "/settings", icon: "⚙️", label: "Réglages" },
];

export function Navbar() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Ferme le menu si clic en dehors
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    if (moreOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [moreOpen]);

  // Ferme le menu sur changement de route
  useEffect(() => { setMoreOpen(false); }, [pathname]);

  const isMoreActive = MORE_ITEMS.some((i) => pathname === i.href);

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-56 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 shadow-soft z-40">
        <div className="px-5 py-6 border-b border-gray-100 dark:border-gray-800">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🌀</span>
            <span className="font-bold text-lg text-primary">Quotidia</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-textLight hover:bg-gray-50 dark:hover:bg-white/10 hover:text-textDark dark:hover:text-white"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800 space-y-1">
          <Link
            href="/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              pathname === "/settings"
                ? "bg-primary text-white"
                : "text-textLight hover:bg-gray-50 dark:hover:bg-white/10 hover:text-textDark dark:hover:text-white"
            }`}
          >
            <span>⚙️</span>
            <span>Paramètres</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-textLight hover:bg-red-50 hover:text-danger transition-all"
          >
            <span>🚪</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom nav ────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 z-40 flex">
        {MOBILE_MAIN.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-3 gap-0.5 text-xs font-medium transition-all ${
                isActive ? "text-primary" : "text-textLight"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Bouton "Plus" */}
        <div ref={moreRef} className="flex-1 relative flex flex-col items-center justify-center">
          <button
            onClick={() => setMoreOpen((v) => !v)}
            className={`flex flex-col items-center py-3 gap-0.5 text-xs font-medium w-full transition-all ${
              isMoreActive || moreOpen ? "text-primary" : "text-textLight"
            }`}
          >
            <span className="text-lg">•••</span>
            <span>Plus</span>
          </button>

          {/* Bulle sous-menu */}
          {moreOpen && (
            <div className="absolute bottom-full mb-3 right-0 w-44 bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
              {MORE_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-textDark dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
