import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStartOfMonth, getEndOfMonth } from "@/lib/utils";
import { generateOccurrenceDates, generateGroupId } from "@/lib/recurring";

const createIncomeSchema = z.object({
  amount: z.number().positive("Le montant doit être positif"),
  category: z.string().min(1, "La catégorie est requise"),
  label: z.string().optional(),
  date: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurrenceInterval: z.enum(["weekly", "monthly", "custom"]).optional(),
  recurrenceDays: z.number().int().min(1).max(365).optional(),
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const monthParam = searchParams.get("month");

    let startDate: Date;
    let endDate: Date;

    if (monthParam && /^\d{4}-(0[1-9]|1[0-2])$/.test(monthParam)) {
      const [year, month] = monthParam.split("-").map(Number);
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59, 999);
    } else {
      startDate = getStartOfMonth();
      endDate = getEndOfMonth();
    }

    const incomes = await db.income.findMany({
      where: {
        userId: session.user.id,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ success: true, data: incomes });
  } catch (error) {
    console.error("[INCOME_GET]", error);
    return NextResponse.json({ success: false, error: "Erreur interne" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createIncomeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const startDate = parsed.data.date ? new Date(parsed.data.date) : new Date();
    const groupId = parsed.data.isRecurring && parsed.data.recurrenceInterval
      ? generateGroupId()
      : null;

    const income = await db.income.create({
      data: {
        userId: session.user.id,
        amount: parsed.data.amount,
        category: parsed.data.category,
        label: parsed.data.label,
        date: startDate,
        isRecurring: parsed.data.isRecurring,
        recurrenceInterval: parsed.data.recurrenceInterval,
        recurrenceDays: parsed.data.recurrenceDays,
        recurringGroupId: groupId,
      },
    });

    // Générer toutes les occurrences suivantes (jusqu'à 12 mois)
    if (groupId && parsed.data.recurrenceInterval) {
      const allDates = generateOccurrenceDates(
        startDate,
        parsed.data.recurrenceInterval,
        parsed.data.recurrenceDays ?? null,
        12
      );
      const futureDates = allDates.slice(1); // exclure la première (déjà créée)

      if (futureDates.length > 0) {
        await db.income.createMany({
          data: futureDates.map((date) => ({
            userId: session.user.id,
            amount: parsed.data.amount,
            category: parsed.data.category,
            label: parsed.data.label ?? null,
            date,
            isRecurring: true,
            recurrenceInterval: parsed.data.recurrenceInterval,
            recurrenceDays: parsed.data.recurrenceDays ?? null,
            recurringGroupId: groupId,
          })),
        });
      }
    }

    return NextResponse.json({ success: true, data: income }, { status: 201 });
  } catch (error) {
    console.error("[INCOME_POST]", error);
    return NextResponse.json({ success: false, error: "Erreur interne" }, { status: 500 });
  }
}
