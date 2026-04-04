import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "@/components/Providers";
import { CookieBanner } from "@/components/ui/CookieBanner";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const APP_URL = process.env.NEXTAUTH_URL ?? "https://quotidia.fr";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Quotidia — Ton quotidien, en mieux.",
    template: "%s | Quotidia",
  },
  description:
    "Suis tes habitudes, gère ton budget, atteins tes objectifs et booste ta productivité avec un assistant IA. Gratuit pour commencer.",
  keywords: [
    "habitudes",
    "tracker habitudes",
    "suivi budget",
    "objectifs",
    "productivité",
    "gamification",
    "dashboard vie",
    "assistant IA",
    "streaks",
    "application gratuite",
  ],
  authors: [{ name: "Quotidia" }],
  creator: "Quotidia",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: APP_URL,
    siteName: "Quotidia",
    title: "Quotidia — Ton quotidien, en mieux.",
    description:
      "Suis tes habitudes, gère ton budget, atteins tes objectifs et booste ta productivité avec un assistant IA.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quotidia — Ton quotidien, en mieux.",
    description:
      "Suis tes habitudes, gère ton budget, atteins tes objectifs et booste ta productivité avec un assistant IA.",
    creator: "@quotidia",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Quotidia",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "theme-color": "#5B5EA6",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
        <CookieBanner />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
