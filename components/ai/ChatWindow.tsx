"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatWindowProps {
  onClose: () => void;
  aiRequestsUsed: number;
  isPremium: boolean;
}

const AI_FREE_LIMIT = 5;

export function ChatWindow({ onClose, aiRequestsUsed, isPremium }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Bonjour ! Je suis Quotidia Coach, ton assistant personnel. Comment puis-je t'aider aujourd'hui ? 😊",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [requestsUsed, setRequestsUsed] = useState(aiRequestsUsed);
  const [limitReached, setLimitReached] = useState(!isPremium && aiRequestsUsed >= AI_FREE_LIMIT);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const remaining = isPremium ? null : Math.max(0, AI_FREE_LIMIT - requestsUsed);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading || limitReached) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Add streaming placeholder
    const placeholderMessage: Message = {
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, placeholderMessage]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content, conversationId }),
      });

      if (res.status === 429) {
        const json = await res.json();
        if (json.limitReached) {
          setLimitReached(true);
          setMessages((prev) => prev.slice(0, -1));
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "Tu as atteint ta limite mensuelle de 5 requêtes. Passe en Premium pour un accès illimité ! ✨",
              timestamp: new Date().toISOString(),
            },
          ]);
          setIsLoading(false);
          return;
        }
      }

      if (!res.ok || !res.body) {
        throw new Error("Erreur de réponse");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        // Check for meta
        if (chunk.includes("__META__")) {
          const parts = chunk.split("__META__");
          accumulatedText += parts[0];
          try {
            const meta = JSON.parse(parts[1]);
            if (meta.conversationId) setConversationId(meta.conversationId);
          } catch {}
        } else {
          accumulatedText += chunk;
        }

        // Update last message
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: accumulatedText.replace(/__META__.*$/, ""),
            timestamp: new Date().toISOString(),
          };
          return updated;
        });
      }

      if (!isPremium) {
        setRequestsUsed((prev) => {
          const next = prev + 1;
          if (next >= AI_FREE_LIMIT) setLimitReached(true);
          return next;
        });
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Désolé, une erreur s'est produite. Réessaie dans un moment.",
          timestamp: new Date().toISOString(),
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="fixed bottom-40 right-5 md:bottom-24 md:right-6 w-[calc(100vw-2.5rem)] md:w-[380px] h-[520px] bg-white rounded-2xl shadow-card border border-gray-100 z-40 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-ai/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-ai/20 flex items-center justify-center text-base">
            🤖
          </div>
          <div>
            <p className="text-sm font-semibold text-textDark">Quotidia Coach</p>
            {!isPremium && (
              <p className="text-xs text-textLight">
                {remaining !== null ? `${remaining} requête${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""}` : ""}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-textLight hover:bg-gray-100 transition text-sm"
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-white rounded-tr-sm"
                  : "bg-gray-50 text-textDark rounded-tl-sm"
              }`}
            >
              {msg.content || (isLoading && idx === messages.length - 1 ? (
                <span className="flex gap-1">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
                </span>
              ) : "")}
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Limit banner */}
      {limitReached && (
        <div className="px-4 py-2.5 bg-accent/10 border-t border-accent/20">
          <p className="text-xs text-accent font-medium mb-1.5">Limite mensuelle atteinte</p>
          <button className="w-full py-2 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition">
            ✨ Passer Premium — 4,99€/mois
          </button>
        </div>
      )}

      {/* Input */}
      {!limitReached && (
        <form onSubmit={sendMessage} className="px-3 py-3 border-t border-gray-100 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Écris ton message..."
            disabled={isLoading}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ai/30 focus:border-ai transition disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 rounded-xl bg-ai text-white flex items-center justify-center disabled:opacity-60 hover:bg-ai/90 transition shrink-0"
            aria-label="Envoyer"
          >
            ➤
          </button>
        </form>
      )}
    </motion.div>
  );
}
