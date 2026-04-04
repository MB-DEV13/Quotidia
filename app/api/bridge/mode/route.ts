import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { isPremium: true },
  });

  if (!user?.isPremium) return NextResponse.json({ error: "Premium requis" }, { status: 403 });

  const body = await req.json();
  const { budgetMode } = body;

  if (budgetMode !== "manual" && budgetMode !== "automatic") {
    return NextResponse.json({ error: "Mode invalide" }, { status: 400 });
  }

  // Si passage en automatique, vérifier qu'une banque est active
  if (budgetMode === "automatic") {
    const connection = await db.bankConnection.findUnique({
      where: { userId: session.user.id },
      select: { status: true },
    });
    if (!connection || connection.status !== "active") {
      return NextResponse.json({ error: "Aucune banque active connectée" }, { status: 400 });
    }
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { budgetMode },
  });

  return NextResponse.json({ success: true, budgetMode });
}
