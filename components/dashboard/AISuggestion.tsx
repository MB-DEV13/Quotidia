import { generateUserContext } from "@/lib/ai-context";
import { openai } from "@/lib/openai";
import { AITipCard } from "@/components/ai/AITipCard";

interface Props {
  userId: string;
  hasHabits: boolean;
}

export async function AISuggestion({ userId, hasHabits }: Props) {
  if (!process.env.OPENAI_API_KEY || !hasHabits) return null;
  try {
    const userContext = await generateUserContext(userId);
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Tu es Quotidia Coach, un assistant bienveillant et motivant. Donne UN conseil court, personnalisé et actionnable (2-3 phrases max). Réponds en français." },
        { role: "user", content: `Voici mes données du jour :\n${userContext}\n\nDonne-moi un conseil motivant pour aujourd'hui.` },
      ],
      max_tokens: 120,
      temperature: 0.8,
    });
    const suggestion = completion.choices[0]?.message?.content?.trim() ?? null;
    if (!suggestion) return null;
    return <AITipCard suggestion={suggestion} />;
  } catch {
    return null;
  }
}
