"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChatWindow } from "./ChatWindow";
import { useState } from "react";

interface ChatBubbleProps {
  aiRequestsUsed: number;
  isPremium: boolean;
}

export function ChatBubble({ aiRequestsUsed, isPremium }: ChatBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);

  const remaining = isPremium ? null : Math.max(0, 5 - aiRequestsUsed);
  const hasLimitWarning = !isPremium && remaining !== null && remaining <= 1;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <ChatWindow
            onClose={() => setIsOpen(false)}
            aiRequestsUsed={aiRequestsUsed}
            isPremium={isPremium}
          />
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-24 right-5 md:bottom-6 md:right-6 w-14 h-14 rounded-2xl bg-ai text-white shadow-[0_8px_24px_rgba(14,165,233,0.4)] flex items-center justify-center z-40 hover:shadow-[0_8px_32px_rgba(14,165,233,0.55)] transition-all"
        whileHover={{ scale: 1.06, y: -2 }}
        whileTap={{ scale: 0.94 }}
        aria-label="Ouvrir le chat IA"
      >
        <motion.div
          key={isOpen ? "close" : "open"}
          initial={{ opacity: 0, rotate: -15, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 15, scale: 0.7 }}
          transition={{ duration: 0.18 }}
        >
          {isOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <circle cx="9" cy="10" r="0.5" fill="currentColor" />
              <circle cx="12" cy="10" r="0.5" fill="currentColor" />
              <circle cx="15" cy="10" r="0.5" fill="currentColor" />
            </svg>
          )}
        </motion.div>

        {hasLimitWarning && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger rounded-full text-white text-[10px] font-bold flex items-center justify-center">
            !
          </span>
        )}
      </motion.button>
    </>
  );
}
