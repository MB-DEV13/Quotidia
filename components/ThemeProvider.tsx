"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggle: () => {},
});

function storageKey(email: string) {
  return `quotidia-theme-${email}`;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const userEmail = session?.user?.email ?? null;
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    if (!userEmail) {
      // Déconnecté → toujours clair
      setTheme("light");
      document.documentElement.classList.remove("dark");
      return;
    }
    // Connecté → préférence propre à ce compte
    const stored = localStorage.getItem(storageKey(userEmail)) as Theme | null;
    const initial = stored ?? "light";
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, [userEmail]);

  function toggle() {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      if (userEmail) localStorage.setItem(storageKey(userEmail), next);
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
