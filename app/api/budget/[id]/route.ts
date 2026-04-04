import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const updateExpenseSchema = z.object({
  amount: z.number().positive().optional(),
  category: z.string().min(1).optional(),
  label: z.string().optional(),
  date: z.string().optional(),
  recurrenceInterval: z.enum(["weekly", "monthly", "custom"]).nullable().optional(),
  recurrenceDays: z.number().int().min(1).max(365).nullable().optional(),
  isRecurring: z.boolean().optional(),
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

    const expense = await db.expense.findUnique({ where: { id } });
    if (!expense || expense.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Dépense introuvable" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateExpenseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const updated = await db.expense.update({
      where: { id },
      data: {
        ...parsed.data,
        date: parsed.data.date ? new Date(parsed.data.date) : undefined,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[EXPENSE_PATCH]", error);
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

    const expense = await db.expense.findUnique({ where: { id } });
    if (!expense || expense.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Dépense introuvable" }, { status: 404 });
    }

    await db.expense.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[EXPENSE_DELETE]", error);
    return NextResponse.json({ success: false, error: "Erreur interne" }, { status: 500 });
  }
}
