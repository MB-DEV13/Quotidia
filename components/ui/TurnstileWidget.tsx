"use client";

import { Turnstile } from "@marsidev/react-turnstile";

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export function TurnstileWidget({ onSuccess, onError, onExpire }: TurnstileWidgetProps) {
  if (!SITE_KEY) return null;

  return (
    <Turnstile
      siteKey={SITE_KEY}
      onSuccess={onSuccess}
      onError={onError}
      onExpire={onExpire}
      options={{ theme: "light", language: "fr" }}
    />
  );
}
