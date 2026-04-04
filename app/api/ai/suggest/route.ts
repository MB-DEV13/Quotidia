import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { openai } from "@/lib/openai";
import { generateUserContext } from "@/lib/ai-context";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { isPremium: true, aiRequestsUsed: true, aiRequestsReset: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "Utilisateur introuvable" }, { status: 404 });
    }

    const userContext = await generateUserContext(session.user.id);

    if (!process.env.OPENAI_API_KEY) {
      // Return a static suggestion if OpenAI is not configured
      return NextResponse.json({
        success: true,
        data: {
          suggestion: "Continue sur ta lancée ! Chaque habitude complétée te rapproche de tes objectifs.",
        },
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Tu es Quotidia Coach. Génère UNE seule suggestion proactive courte (1-2 phrases max) et motivante en français pour aider l'utilisateur à améliorer son quotidien. Basé sur ses données, identifie le point le plus important à améliorer.",
        },
        {
          role: "user",
          content: `Données utilisateur:\n${userContext}\n\nGénère une suggestion proactive courte et motivante.`,
        },
      ],
      max_tokens: 100,
      temperature: 0.8,
    });

    const suggestion = completion.choices[0]?.message?.content ?? "Continue sur ta lancée !";

    return NextResponse.json({
      success: true,
      data: { suggestion },
    });
  } catch (error) {
    console.error("[AI_SUGGEST]", error);
    return NextResponse.json({
      success: true,
      data: { suggestion: "Chaque petit pas compte. Continue comme ça !" },
    });
  }
}
