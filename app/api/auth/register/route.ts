import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimitAsync, getIp } from "@/lib/rate-limit";
import { getResend, FROM_EMAIL } from "@/lib/resend";
import { verifyEmailHtml } from "@/lib/email-templates";
import { verifyTurnstile } from "@/lib/turnstile";

const registerSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  avatar: z.string().max(200000).refine(
    (v) => !v || v.startsWith("preset:") || v.startsWith("emoji:") || v.startsWith("data:image/") || /^https:\/\/.+/.test(v),
    { message: "Avatar invalide" }
  ).optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  showInLeaderboard: z.boolean().default(true),
  turnstileToken: z.string().optional(),
});

export async function POST(req: Request) {
  // 5 inscriptions max par IP par 15 minutes
  const { allowed, retryAfterMs } = await rateLimitAsync(`register:${getIp(req)}`, 5, 15 * 60 * 1000);
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

    const { name, email, password, avatar, country, region, city, showInLeaderboard, turnstileToken } = parsed.data;

    const captchaOk = await verifyTurnstile(turnstileToken);
    if (!captchaOk) {
      return NextResponse.json({ success: false, error: "Captcha invalide. Réessaie." }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Cet email est déjà utilisé." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

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
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry,
      },
      select: { id: true, email: true, name: true },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "https://myquotidia.app";
    const verifyUrl = `${appUrl}/api/auth/verify-email?token=${verificationToken}`;

    if (!process.env.RESEND_API_KEY) {
      console.error("[REGISTER] RESEND_API_KEY manquant — email de vérification non envoyé");
    } else {
      try {
        const result = await getResend().emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: "Confirme ton adresse email — Quotidia 📧",
          html: verifyEmailHtml(name ?? null, verifyUrl),
        });
        if (result.error) {
          console.error("[REGISTER_VERIFY_EMAIL] Resend error:", result.error);
        }
      } catch (err) {
        console.error("[REGISTER_VERIFY_EMAIL] Exception:", err);
      }
    }

    return NextResponse.json({ success: true, data: { ...user, requiresVerification: true } }, { status: 201 });
  } catch (error) {
    console.error("[REGISTER]", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
