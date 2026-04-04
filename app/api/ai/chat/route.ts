import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { openai } from "@/lib/openai";
import { generateUserContext } from "@/lib/ai-context";
import { FREE_LIMITS } from "@/lib/constants";

const chatSchema = z.object({
  message: z.string().min(1, "Le message est requis").max(1000),
  conversationId: z.string().optional(),
});

type Message = { role: "user" | "assistant"; content: string; timestamp: string };

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = chatSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { isPremium: true, aiRequestsUsed: true, aiRequestsReset: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "Utilisateur introuvable" }, { status: 404 });
    }

    // Rate limiting for free users
    if (!user.isPremium) {
      const now = new Date();
      const resetDate = user.aiRequestsReset;
      const shouldReset = !resetDate || resetDate.getMonth() !== now.getMonth() || resetDate.getFullYear() !== now.getFullYear();

      if (shouldReset) {
        // Réinitialisation atomique du compteur en début de mois
        await db.user.update({
          where: { id: session.user.id },
          data: { aiRequestsUsed: 1, aiRequestsReset: now },
        });
      } else {
        // Incrément atomique avec vérification de limite en une seule opération
        const updated = await db.user.updateMany({
          where: {
            id: session.user.id,
            aiRequestsUsed: { lt: FREE_LIMITS.AI_REQUESTS_PER_MONTH },
          },
          data: { aiRequestsUsed: { increment: 1 } },
        });
        if (updated.count === 0) {
          return NextResponse.json(
            {
              success: false,
              error: "Limite mensuelle atteinte (5 requêtes/mois). Passe en Premium pour un accès illimité.",
              limitReached: true,
            },
            { status: 429 }
          );
        }
      }
    }

    // Get or create conversation
    let conversation: { id: string; messages: Message[] } | null = null;

    if (parsed.data.conversationId) {
      const existing = await db.aiConversation.findUnique({
        where: { id: parsed.data.conversationId },
      });
      if (existing && existing.userId === session.user.id) {
        conversation = {
          id: existing.id,
          messages: existing.messages as Message[],
        };
      }
    }

    if (!conversation) {
      const created = await db.aiConversation.create({
        data: {
          userId: session.user.id,
          messages: [],
        },
      });
      conversation = { id: created.id, messages: [] };
    }

    // Generate user context
    const userContext = await generateUserContext(session.user.id);

    const systemPrompt = `Tu es Quotidia Coach, un assistant IA bienveillant, motivant et positif intégré dans l'application Quotidia. Tu aides les utilisateurs à améliorer leurs habitudes, gérer leur budget et atteindre leurs objectifs. Tu réponds toujours en français, de façon concise (max 3 paragraphes), avec empathie et encouragement.

Données actuelles de l'utilisateur:
${userContext}

Règles:
- Réponds toujours en français
- Sois encourageant et bienveillant
- Donne des conseils concrets et actionnables
- Si tu n'as pas assez d'informations, demande des précisions
- Ne jamais inventer de données sur l'utilisateur`;

    const messages = conversation.messages;
    const newUserMessage: Message = {
      role: "user",
      content: parsed.data.message,
      timestamp: new Date().toISOString(),
    };

    const openaiMessages = [
      ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user" as const, content: parsed.data.message },
    ];

    // Stream response
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }, ...openaiMessages],
      stream: true,
      max_tokens: 500,
      temperature: 0.7,
    });

    let fullResponse = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) {
              fullResponse += text;
              controller.enqueue(new TextEncoder().encode(text));
            }
          }

          // Save conversation
          const assistantMessage: Message = {
            role: "assistant",
            content: fullResponse,
            timestamp: new Date().toISOString(),
          };

          const updatedMessages = [...messages, newUserMessage, assistantMessage];

          await db.aiConversation.update({
            where: { id: conversation!.id },
            data: { messages: updatedMessages },
          });

          // Send conversation ID at the end
          const meta = JSON.stringify({ conversationId: conversation!.id });
          controller.enqueue(new TextEncoder().encode(`\n\n__META__${meta}`));
          controller.close();
        } catch (err) {
          console.error("[AI_STREAM]", err);
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Conversation-Id": conversation.id,
      },
    });
  } catch (error) {
    console.error("[AI_CHAT]", error);
    return NextResponse.json({ success: false, error: "Erreur interne" }, { status: 500 });
  }
}
