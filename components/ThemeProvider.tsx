"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggle: () => {},
});

// Pages de l'app où le thème sombre est autorisé
const APP_PATHS = [
  "/dashboard", "/habits", "/budget", "/goals",
  "/settings", "/stats", "/bilan", "/classement",
  "/upgrade", "/onboarding",
];

function storageKey(email: string) {
  return `quotidia-theme-${email}`;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const userEmail = session?.user?.email ?? null;
  const [theme, setTheme] = useState<Theme>("light");

  const isAppPage = APP_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    // Toujours clair sur les pages publiques (landing, login, register, etc.)
    if (!userEmail || !isAppPage) {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      return;
    }
    // Pages de l'app : préférence stockée par compte
    const stored = localStorage.getItem(storageKey(userEmail)) as Theme | null;
    const resolved = stored ?? "light";
    setTheme(resolved);
    document.documentElement.classList.toggle("dark", resolved === "dark");
  }, [userEmail, isAppPage]);

  function toggle() {
    if (!userEmail || !isAppPage) return;
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem(storageKey(userEmail), next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
