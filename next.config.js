/** @type {import('next').NextConfig} */
const { withSentryConfig } = require("@sentry/nextjs");
const withNextIntl = require("next-intl/plugin")("./i18n/request.ts");
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://eu.i.posthog.com https://eu-assets.i.posthog.com https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://eu.i.posthog.com https://eu-assets.i.posthog.com https://api.stripe.com https://api.bridgeapi.io https://vitals.vercel-insights.com https://*.sentry.io https://*.ingest.sentry.io https://ingest.de.sentry.io https://o4511869098524672.ingest.de.sentry.io",
      "frame-src https://js.stripe.com https://hooks.stripe.com https://challenges.cloudflare.com",
      "worker-src 'self' blob:",
    ].join("; "),
  },
];

const nextConfig = {
  outputFileTracingRoot: __dirname,
  // Compression Gzip/Brotli pour tous les assets
  compress: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      // Cache long terme pour les assets statiques (polices, images, JS/CSS hachés)
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/icons/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

module.exports = withSentryConfig(withNextIntl(nextConfig), {
  org: "quotidia",
  project: "javascript-nextjs",

  // Upload des source maps silencieusement
  silent: !process.env.CI,

  // Désactive le tunnel Sentry (utilise le CDN directement)
  tunnelRoute: undefined,

  // Cache les source maps dans le bundle final
  hideSourceMaps: true,

  // Désactive le treeshaking agressif pour garder les traces d'erreurs complètes
  disableLogger: true,

  automaticVercelMonitors: true,
});
