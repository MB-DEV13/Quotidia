import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#5B5EA6",
        accent: "#9B72CF",
        success: "#4CAF50",
        warning: "#FF9800",
        danger: "#EF4444",
        ai: "#0EA5E9",
        background: "#F5F3FF",
        surface: "#FFFFFF",
        textDark: "#2D2D2D",
        textLight: "#888888",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0,0,0,0.06)",
        card: "0 4px 16px rgba(91,94,166,0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
