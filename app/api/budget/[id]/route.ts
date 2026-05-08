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

    const newDate = parsed.data.date ? new Date(parsed.data.date) : undefined;

    const updated = await db.expense.update({
      where: { id },
      data: { ...parsed.data, date: newDate },
    });

    // Mettre à jour toutes les occurrences futures du même groupe
    if (expense.recurringGroupId) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const futureOccurrences = await db.expense.findMany({
        where: {
          recurringGroupId: expense.recurringGroupId,
          id: { not: id },
          date: { gt: today },
        },
        select: { id: true, date: true },
      });

      if (futureOccurrences.length > 0) {
        const newDay = newDate ? newDate.getDate() : null;

        await db.$transaction(
          futureOccurrences.map((occ) => {
            const occDate = new Date(occ.date);
            let updatedDate: Date | undefined;
            if (newDay !== null) {
              const maxDay = new Date(occDate.getFullYear(), occDate.getMonth() + 1, 0).getDate();
              updatedDate = new Date(occDate.getFullYear(), occDate.getMonth(), Math.min(newDay, maxDay));
            }
            return db.expense.update({
              where: { id: occ.id },
              data: {
                ...(parsed.data.amount !== undefined && { amount: parsed.data.amount }),
                ...(parsed.data.category !== undefined && { category: parsed.data.category }),
                ...(parsed.data.label !== undefined && { label: parsed.data.label }),
                ...(updatedDate && { date: updatedDate }),
                ...(parsed.data.recurrenceInterval !== undefined && { recurrenceInterval: parsed.data.recurrenceInterval }),
                ...(parsed.data.recurrenceDays !== undefined && { recurrenceDays: parsed.data.recurrenceDays }),
              },
            });
          })
        );
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[EXPENSE_PATCH]", error);
    return NextResponse.json({ success: false, error: "Erreur interne" }, { status: 500 });
  }
}

export async function DELETE(
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

    const { searchParams } = new URL(req.url);
    const deleteGroup = searchParams.get("deleteGroup") === "true";

    if (deleteGroup && expense.recurringGroupId) {
      await db.expense.deleteMany({
        where: { userId: session.user.id, recurringGroupId: expense.recurringGroupId },
      });
    } else {
      await db.expense.delete({ where: { id } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[EXPENSE_DELETE]", error);
    return NextResponse.json({ success: false, error: "Erreur interne" }, { status: 500 });
  }
}
