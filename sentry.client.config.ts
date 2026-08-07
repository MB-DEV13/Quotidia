import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Capture 10% des transactions en prod, 100% en dev
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Capture les replays de session uniquement sur les erreurs
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.05,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Ne pas envoyer d'erreurs en dev local
  enabled: process.env.NODE_ENV !== "development",
});
