import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getResend, FROM_EMAIL } from "@/lib/resend";
import { rateLimit, getIp } from "@/lib/rate-limit";
import crypto from "crypto";

export async function POST(req: Request) {
  // 3 demandes max par IP par heure
  const ip = getIp(req);
  const { allowed, retryAfterMs } = rateLimit(`forgot:${ip}`, 3, 60 * 60 * 1000);
  if (!allowed) {
    // Réponse identique au succès pour ne pas révéler le rate limiting
    return NextResponse.json({ success: true });
  }

  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email requis." }, { status: 400 });

    // Rate limit supplémentaire par email : 3 demandes max par heure
    const { allowed: emailAllowed } = rateLimit(`forgot-email:${email}`, 3, 60 * 60 * 1000);
    if (!emailAllowed) {
      return NextResponse.json({ success: true }); // Même réponse silencieuse
    }

    const user = await db.user.findUnique({ where: { email } });

    // Réponse identique qu'il existe ou non (sécurité anti-énumération)
    if (!user || !user.password) {
      return NextResponse.json({ success: true });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 heure

    await db.user.update({
      where: { email },
      data: { resetToken: hashedToken, resetTokenExpiry: expiry },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Réinitialisation de ton mot de passe — Quotidia",
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #F5F3FF; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 32px;">🌀</span>
            <h1 style="color: #5B5EA6; font-size: 20px; margin: 8px 0 0;">Quotidia</h1>
          </div>
          <div style="background: white; border-radius: 16px; padding: 28px;">
            <h2 style="color: #2D2D2D; font-size: 18px; margin: 0 0 12px;">Réinitialisation du mot de passe</h2>
            <p style="color: #888; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
              Tu as demandé à réinitialiser ton mot de passe. Clique sur le bouton ci-dessous — ce lien est valable <strong>1 heure</strong>.
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #5B5EA6, #9B72CF); color: white; font-weight: 600; font-size: 14px; padding: 14px 32px; border-radius: 12px; text-decoration: none;">
                Réinitialiser mon mot de passe →
              </a>
            </div>
            <p style="color: #aaa; font-size: 12px; margin: 16px 0 0; text-align: center;">
              Si tu n'as pas fait cette demande, ignore cet email. Ton mot de passe ne changera pas.
            </p>
          </div>
          <p style="color: #bbb; font-size: 11px; text-align: center; margin-top: 20px;">
            © ${new Date().getFullYear()} Quotidia — Ton quotidien, en mieux.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
