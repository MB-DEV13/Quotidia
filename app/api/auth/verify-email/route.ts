import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "https://myquotidia.app";

  if (!token || token.length !== 64) {
    return NextResponse.redirect(new URL("/login?error=verification_invalid", appUrl));
  }

  const user = await db.user.findUnique({
    where: { emailVerificationToken: token },
    select: { id: true, emailVerified: true, emailVerificationExpiry: true },
  });

  if (!user) {
    return NextResponse.redirect(new URL("/login?error=verification_invalid", appUrl));
  }

  if (user.emailVerified) {
    return NextResponse.redirect(new URL("/login?verified=already", appUrl));
  }

  if (user.emailVerificationExpiry && user.emailVerificationExpiry < new Date()) {
    return NextResponse.redirect(new URL("/login?error=verification_expired", appUrl));
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      emailVerificationToken: null,
      emailVerificationExpiry: null,
    },
  });

  return NextResponse.redirect(new URL("/login?verified=true", appUrl));
}
