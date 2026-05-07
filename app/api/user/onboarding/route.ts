import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const onboardingSchema = z.object({
  country: z.string().max(100).optional().nullable(),
  region: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  showInLeaderboard: z.boolean().optional(),
  avatar: z.string().max(500).refine(
    (v) => !v || v.startsWith("preset:") || /^https:\/\/.+/.test(v),
    { message: "Avatar invalide" }
  ).optional(),
}).optional();

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    let profileData = {};
    try {
      const body = await req.json();
      const parsed = onboardingSchema.safeParse(body);
      if (parsed.success && parsed.data) {
        const { country, region, city, showInLeaderboard, avatar } = parsed.data;
        if (country !== undefined) {
          profileData = {
            country: country || null,
            region: region || null,
            city: city || null,
            ...(showInLeaderboard !== undefined ? { showInLeaderboard } : {}),
            ...(avatar ? { avatar } : {}),
          };
        }
      }
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
