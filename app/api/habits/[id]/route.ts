import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const updateHabitSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  frequency: z.string().refine(
    (v) => !v || v === "daily" || v === "weekly" || /^days:[1-7](,[1-7])*$/.test(v) || /^once:\d{4}-\d{2}-\d{2}$/.test(v),
    { message: "Fréquence invalide" }
  ).optional(),
  isArchived: z.boolean().optional(),
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

    const habit = await db.habit.findUnique({ where: { id } });
    if (!habit || habit.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Habitude introuvable" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateHabitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const updated = await db.habit.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[HABIT_PATCH]", error);
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

    const habit = await db.habit.findUnique({ where: { id } });
    if (!habit || habit.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Habitude introuvable" }, { status: 404 });
    }

    await db.habit.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[HABIT_DELETE]", error);
    return NextResponse.json({ success: false, error: "Erreur interne" }, { status: 500 });
  }
}
