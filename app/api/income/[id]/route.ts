import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const patchSchema = z.object({
  amount: z.number().positive().optional(),
  label: z.string().optional(),
  category: z.string().min(1).optional(),
  date: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurrenceInterval: z.enum(["weekly", "monthly", "custom"]).optional(),
  recurrenceDays: z.number().int().min(1).max(365).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const income = await db.income.findUnique({ where: { id } });
    if (!income || income.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Revenu introuvable" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const updated = await db.income.update({
      where: { id },
      data: {
        ...parsed.data,
        date: parsed.data.date ? new Date(parsed.data.date) : undefined,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[INCOME_PATCH]", error);
    return NextResponse.json({ success: false, error: "Erreur interne" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const income = await db.income.findUnique({ where: { id } });
    if (!income || income.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Revenu introuvable" }, { status: 404 });
    }

    await db.income.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[INCOME_DELETE]", error);
    return NextResponse.json({ success: false, error: "Erreur interne" }, { status: 500 });
  }
}
