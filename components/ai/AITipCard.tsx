"use client";

interface AITipCardProps {
  suggestion: string;
  onOpenChat?: () => void;
}

export function AITipCard({ suggestion, onOpenChat }: AITipCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-soft p-5 border-l-4 border-ai">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-ai/10 flex items-center justify-center text-base shrink-0">
          🤖
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-ai uppercase tracking-wide mb-1">
            Conseil du jour
          </p>
          <p className="text-sm text-textDark leading-relaxed">{suggestion}</p>
        </div>
      </div>
      {onOpenChat && (
        <button
          onClick={onOpenChat}
          className="mt-3 text-xs text-ai font-semibold hover:underline"
        >
          Ouvrir le chat →
        </button>
      )}
    </div>
  );
}
