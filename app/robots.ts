import { MetadataRoute } from "next";

const APP_URL = process.env.NEXTAUTH_URL ?? "https://quotidia.fr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/register", "/login", "/contact", "/legal"],
        disallow: [
          "/dashboard",
          "/habits",
          "/budget",
          "/goals",
          "/settings",
          "/upgrade",
          "/stats",
          "/classement",
          "/bilan",
          "/api/",
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
