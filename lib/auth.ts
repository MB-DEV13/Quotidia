import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// Le PrismaAdapter standard attend un champ `image` sur User,
// mais notre schéma utilise `avatar`. On surcharge createUser pour mapper les deux.
const prismaAdapter = PrismaAdapter(db);
const customAdapter = {
  ...prismaAdapter,
  async createUser(user: { name?: string | null; email: string; emailVerified: Date | null; image?: string | null }) {
    const created = await db.user.create({
      data: {
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        avatar: user.image ?? "preset:1",
      },
    });
    return { ...created, image: created.avatar ?? null };
  },
};

export const authOptions: NextAuthOptions = {
  adapter: customAdapter as NextAuthOptions["adapter"],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  pages: {
    signIn: "/login",
    newUser: "/onboarding", // Nouveaux utilisateurs Google → onboarding directement
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Uniquement pour les comptes credentials (Google est toujours vérifié)
      if (account?.provider === "credentials" && user?.id) {
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { emailVerified: true, emailVerificationToken: true },
        });
        // Bloque seulement si un token de vérification est en attente (nouveau compte)
        if (!dbUser?.emailVerified && dbUser?.emailVerificationToken) {
          return "/login?error=EmailNotVerified";
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
