"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function CheckEmailPage() {
  const t = useTranslations("auth.checkEmail");

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEmail(params.get("email") ?? "");
  }, []);

  async function handleResend() {
    if (!email || loading) return;
    setLoading(true);
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-card p-8 text-center">
          <div className="text-6xl mb-4">📧</div>
          <h1 className="text-2xl font-bold text-textDark mb-2">{t("title")}</h1>
          <p className="text-textLight text-sm mb-2">
            {t("subtitle")}
          </p>
          {email && (
            <p className="font-semibold text-textDark text-sm mb-6 break-all">{email}</p>
          )}
          <p className="text-textLight text-xs mb-8 leading-relaxed">
            {t("hint")}
          </p>

          {sent ? (
            <div className="bg-success/10 text-success text-sm font-medium px-4 py-3 rounded-xl mb-6">
              {t("resent")}
            </div>
          ) : (
            <button
              onClick={handleResend}
              disabled={loading}
              className="w-full mb-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-textDark hover:bg-gray-50 transition disabled:opacity-60"
            >
              {loading ? t("resending") : t("resend")}
            </button>
          )}

          <Link
            href="/login"
            className="block text-xs text-textLight hover:text-textDark transition"
          >
            {t("backToLogin")}
          </Link>
        </div>

        <p className="text-center text-xs text-textLight mt-6">
          {t("alreadyVerified")}{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            {t("signIn")}
          </Link>
        </p>
      </div>
    </main>
  );
}
