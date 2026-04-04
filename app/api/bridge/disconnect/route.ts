import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    await db.bankConnection.update({
      where: { userId: session.user.id },
      data: { status: "disconnected", bridgeItemId: null },
    });

    await db.user.update({
      where: { id: session.user.id },
      data: { budgetMode: "manual" },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[BRIDGE_DISCONNECT]", err);
    return NextResponse.json({ error: "Erreur lors de la déconnexion" }, { status: 500 });
  }
}
