/**
 * Rate limiter en mémoire — sliding window.
 * Fonctionne sur instance unique (dev / VPS).
 * Pour Vercel multi-instance, remplacer par Upstash Redis.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Nettoyage toutes les 5 minutes pour éviter les fuites mémoire
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.timestamps.length === 0 || now - entry.timestamps[entry.timestamps.length - 1] > 60 * 60 * 1000) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Vérifie et enregistre une tentative.
 * @param key     Identifiant unique (ex: `register:1.2.3.4`)
 * @param limit   Nombre max de requêtes autorisées dans la fenêtre
 * @param windowMs Durée de la fenêtre en millisecondes
 * @returns `{ allowed: boolean, remaining: number, retryAfterMs: number }`
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const cutoff = now - windowMs;

  const entry = store.get(key) ?? { timestamps: [] };
  // Ne garder que les timestamps dans la fenêtre glissante
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= limit) {
    const oldest = entry.timestamps[0];
    const retryAfterMs = oldest + windowMs - now;
    store.set(key, entry);
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  entry.timestamps.push(now);
  store.set(key, entry);

  return {
    allowed: true,
    remaining: limit - entry.timestamps.length,
    retryAfterMs: 0,
  };
}

/** Extrait l'IP depuis les headers de la requête Next.js */
export function getIp(req: Request): string {
  const forwarded = (req as Request & { headers: Headers }).headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
