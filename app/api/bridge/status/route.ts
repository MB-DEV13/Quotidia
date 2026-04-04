import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const bankConnection = await db.bankConnection.findUnique({
    where: { userId: session.user.id },
    select: { status: true, bankName: true, bankLogoUrl: true, lastSyncAt: true },
  });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { budgetMode: true },
  });

  return NextResponse.json({
    connection: bankConnection,
    budgetMode: user?.budgetMode ?? "manual",
  });
}
