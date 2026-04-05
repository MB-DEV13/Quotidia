import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    let profileData = {};
    try {
      const body = await req.json();
      if (body.country) profileData = {
        country: body.country || null,
        region: body.region || null,
        city: body.city || null,
        showInLeaderboard: body.showInLeaderboard ?? true,
      };
    } catch {
      // body vide = pas de données profil, c'est ok
    }

    await db.user.update({
      where: { id: session.user.id },
      data: { onboardingCompleted: true, ...profileData },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ONBOARDING]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
