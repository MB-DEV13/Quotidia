"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { config } from "@/lib/config";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

function ResetPasswordContent() {
  const t = useTranslations("auth.resetPassword");
  const tCommon = useTranslations("auth.common");
  const tRegister = useTranslations("auth.register");

  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  const passwordStrength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3;
  const strengthLabel = ["", tCommon("strength.tooShort"), tCommon("strength.ok"), tCommon("strength.strong")];
  const strengthColor = ["", "bg-danger", "bg-warning", "bg-success"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError(t("errors.passwordsMismatch"));
      return;
    }
    if (password.length < 8) {
      setError(t("errors.passwordTooShort"));
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || t("errors.serverError"));
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 3000);
  }

  if (!token) return null;

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">

      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <span className="text-3xl">🌀</span>
          <span className="font-bold text-xl text-primary">{config.app.name}</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-card p-8">
          {success ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">✅</div>
              <h1 className="text-xl font-bold text-textDark mb-2">{t("successTitle")}</h1>
              <p className="text-sm text-textLight mb-6">
                {t("successSubtitle")}
              </p>
              <Link href="/login" className="inline-block w-full text-center bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl transition text-sm">
                {t("loginNow")}
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-textDark mb-1">{t("title")}</h1>
                <p className="text-sm text-textLight">{t("subtitle")}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <p className="text-sm text-danger bg-red-50 p-3 rounded-xl">{error}</p>
                )}

                {/* Nouveau mot de passe */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-textDark mb-1">
                    {t("newPasswordLabel")}
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoFocus
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                      placeholder={tCommon("passwordMin")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-textLight hover:text-textDark transition"
                      aria-label={showPassword ? tCommon("hide") : tCommon("show")}
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                  {/* Jauge de force */}
                  {password.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex gap-1 flex-1">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= passwordStrength ? strengthColor[passwordStrength] : "bg-gray-100"}`} />
                        ))}
                      </div>
                      <span className={`text-xs font-medium ${passwordStrength === 1 ? "text-danger" : passwordStrength === 2 ? "text-warning" : "text-success"}`}>
                        {strengthLabel[passwordStrength]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirmation */}
                <div>
                  <label htmlFor="confirm" className="block text-sm font-medium text-textDark mb-1">
                    {t("confirmLabel")}
                  </label>
                  <div className="relative">
                    <input
                      id="confirm"
                      type={showConfirm ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                      placeholder={t("confirmPlaceholder")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-textLight hover:text-textDark transition"
                      aria-label={showConfirm ? tCommon("hide") : tCommon("show")}
                    >
                      <EyeIcon open={showConfirm} />
                    </button>
                  </div>
                  {confirm.length > 0 && password !== confirm && (
                    <p className="text-xs text-danger mt-1">{t("errors.passwordsMismatch")}</p>
                  )}
                  {confirm.length > 0 && password === confirm && password.length >= 8 && (
                    <p className="text-xs text-success mt-1">{tRegister("passwordsMatch")}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t("submitting")}
                    </>
                  ) : (
                    t("submit")
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
