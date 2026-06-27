import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "@/components/Providers";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CookieBanner } from "@/components/ui/CookieBanner";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { config } from "@/lib/config";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const APP_URL = process.env.NEXTAUTH_URL ?? config.app.url;

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${config.app.name} — ${config.app.tagline}`,
    template: `%s | ${config.app.name}`,
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
  authors: [{ name: config.app.name }],
  creator: config.app.name,
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: APP_URL,
    siteName: config.app.name,
    title: `${config.app.name} — ${config.app.tagline}`,
    description:
      "Suis tes habitudes, gère ton budget, atteins tes objectifs et booste ta productivité avec un assistant IA.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${config.app.name} — ${config.app.tagline}`,
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
    title: config.app.name,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "theme-color": "#5B5EA6",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        {/* Preconnect pour Google Fonts (accélère le chargement Inter) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS prefetch PostHog pour éviter la latence DNS */}
        <link rel="dns-prefetch" href="https://eu.i.posthog.com" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ErrorBoundary>
            <Providers>{children}</Providers>
          </ErrorBoundary>
          <CookieBanner />
          <ServiceWorkerRegistration />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
