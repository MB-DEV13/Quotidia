import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { createBridgeUser, authenticateBridgeUser, getBridgeConnectUrl } from "@/lib/bridge";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { isPremium: true, email: true, bankConnection: true },
  });
  if (!user?.isPremium) return NextResponse.json({ error: "Premium requis" }, { status: 403 });

  try {
    let bridgeUserId = user.bankConnection?.bridgeUserId;

    // Créer l'utilisateur Bridge si inexistant
    if (!bridgeUserId) {
      const bridgeUser = await createBridgeUser();
      bridgeUserId = bridgeUser.uuid;

      await db.bankConnection.create({
        data: {
          userId: session.user.id,
          bridgeUserId,
          status: "pending",
        },
      });
    }

    // Authentifier l'utilisateur Bridge pour obtenir un token
    const auth = await authenticateBridgeUser(bridgeUserId);
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/bridge/callback`;

    // Obtenir l'URL de connexion Bridge Connect
    const connectUrl = await getBridgeConnectUrl(auth.access_token, redirectUri, user.email!);

    return NextResponse.json({ url: connectUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[BRIDGE_CONNECT]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
