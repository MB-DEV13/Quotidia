import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { rateLimitAsync, getIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const { allowed } = await rateLimitAsync(`reset-pwd:${getIp(req)}`, 10, 15 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de tentatives. Réessaie dans quelques minutes." }, { status: 429 });
  }

  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Données manquantes." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères." }, { status: 400 });
    }

    const hmacSecret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
    if (!hmacSecret) {
      console.error("[reset-password] NEXTAUTH_SECRET manquant");
      return NextResponse.json({ error: "Erreur de configuration serveur." }, { status: 500 });
    }
    const hashedToken = crypto.createHmac("sha256", hmacSecret).update(token).digest("hex");

    // Invalider le token atomiquement : updateMany avec conditions = pas de race condition
    const hashed = await bcrypt.hash(password, 12);
    const result = await db.user.updateMany({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: { gt: new Date() },
      },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Lien invalide ou expiré. Refais une demande." }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[reset-password]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
