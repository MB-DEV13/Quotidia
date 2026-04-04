import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, getIp } from "@/lib/rate-limit";
import { getResend, FROM_EMAIL } from "@/lib/resend";
import { welcomeEmailHtml } from "@/lib/email-templates";

const registerSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  avatar: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  showInLeaderboard: z.boolean().default(true),
});

export async function POST(req: Request) {
  // 5 inscriptions max par IP par 15 minutes
  const { allowed, retryAfterMs } = rateLimit(`register:${getIp(req)}`, 5, 15 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: "Trop de tentatives. Réessaie dans quelques minutes." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
      }
    );
  }

  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, avatar, country, region, city, showInLeaderboard } = parsed.data;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Cet email est déjà utilisé." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        avatar: avatar ?? "preset:1",
        country: country || null,
        region: region || null,
        city: city || null,
        showInLeaderboard,
      },
      select: { id: true, email: true, name: true },
    });

    // Email de bienvenue (non bloquant)
    const appUrl = process.env.NEXTAUTH_URL ?? "https://quotidia.fr";
    getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Bienvenue sur Quotidia 🌀",
      html: welcomeEmailHtml(name ?? null, appUrl),
    }).catch((err) => console.error("[REGISTER_WELCOME_EMAIL]", err));

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    console.error("[REGISTER]", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
