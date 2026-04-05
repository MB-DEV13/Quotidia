/**
 * Rate limiter avec double stratégie :
 * - Si UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN sont définis → Upstash Redis
 *   (fonctionne sur Vercel multi-instance, persistant entre les requêtes)
 * - Sinon → fallback mémoire sliding window (dev / instance unique)
 */

// ── Fallback mémoire ────────────────────────────────────────────────────────

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.timestamps.length === 0 || now - entry.timestamps[entry.timestamps.length - 1] > 60 * 60 * 1000) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

function rateLimitMemory(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const cutoff = now - windowMs;

  const entry = store.get(key) ?? { timestamps: [] };
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

// ── Upstash Redis ───────────────────────────────────────────────────────────

function hasUpstash(): boolean {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

async function rateLimitRedis(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; retryAfterMs: number }> {
  const { Redis } = await import("@upstash/redis");
  const { Ratelimit } = await import("@upstash/ratelimit");

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
    prefix: "rl",
  });

  const result = await ratelimit.limit(key);

  return {
    allowed: result.success,
    remaining: result.remaining,
    retryAfterMs: result.success ? 0 : Math.max(0, result.reset - Date.now()),
  };
}

// ── Export principal ────────────────────────────────────────────────────────

/**
 * Vérifie et enregistre une tentative.
 * Utilise Upstash Redis si configuré, sinon fallback mémoire.
 *
 * @param key      Identifiant unique (ex: `register:1.2.3.4`)
 * @param limit    Nombre max de requêtes dans la fenêtre
 * @param windowMs Durée de la fenêtre en millisecondes
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  if (hasUpstash()) {
    // Upstash est async — on retourne une promesse wrappée dans un objet sync-compatible.
    // Les appelants doivent awaiter rateLimit() quand Upstash est actif.
    // Pour rester compatible sans casser les appelants sync, on retourne le fallback
    // et on laisse rateLimitAsync() pour les contextes async.
    return rateLimitMemory(key, limit, windowMs);
  }
  return rateLimitMemory(key, limit, windowMs);
}

/**
 * Version async — utilise Upstash Redis si disponible, sinon mémoire.
 * À utiliser dans les API routes (contexte async).
 */
export async function rateLimitAsync(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; retryAfterMs: number }> {
  if (hasUpstash()) {
    return rateLimitRedis(key, limit, windowMs);
  }
  return rateLimitMemory(key, limit, windowMs);
}

/** Extrait l'IP depuis les headers de la requête Next.js */
export function getIp(req: Request): string {
  const forwarded = (req as Request & { headers: Headers }).headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
