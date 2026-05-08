import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimitAsync } from "@/lib/rate-limit";
import { getResend, FROM_EMAIL } from "@/lib/resend";
import { verifyEmailHtml } from "@/lib/email-templates";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Email invalide" }, { status: 400 });
    }

    const { email } = parsed.data;

    // 3 tentatives par email par heure
    const { allowed } = await rateLimitAsync(`resend-verify:${email}`, 3, 60 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json({ success: true }); // Silencieux pour ne pas révéler l'état
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, name: true, emailVerified: true },
    });

    // Ne révèle pas si l'email existe ou est déjà vérifié
    if (!user || user.emailVerified) {
      return NextResponse.json({ success: true });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.user.update({
      where: { id: user.id },
      data: { emailVerificationToken: token, emailVerificationExpiry: expiry },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "https://myquotidia.app";
    const verifyUrl = `${appUrl}/api/auth/verify-email?token=${token}`;

    if (process.env.RESEND_API_KEY) {
      try {
        const result = await getResend().emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: "Confirme ton adresse email — Quotidia 📧",
          html: verifyEmailHtml(user.name, verifyUrl),
        });
        if (result.error) console.error("[RESEND_VERIFY_EMAIL] Resend error:", result.error);
      } catch (err) {
        console.error("[RESEND_VERIFY_EMAIL] Exception:", err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[RESEND_VERIFICATION]", error);
    return NextResponse.json({ success: false, error: "Erreur interne" }, { status: 500 });
  }
}
