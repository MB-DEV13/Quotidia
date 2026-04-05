import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// En production Vercel (serverless), chaque instance doit utiliser 1 seule connexion.
// DATABASE_URL doit pointer vers le Transaction Pooler Supabase (port 6543)
// avec ?pgbouncer=true&connection_limit=1 en suffixe.
// DIRECT_URL reste la connexion directe (port 5432) pour les migrations Prisma.
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
