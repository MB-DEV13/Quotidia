"use client";

import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

export function SignOutButton() {
  const t = useTranslations("settings");
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-danger hover:bg-red-50 transition rounded-xl"
    >
      <span>🚪</span>
      {t("signOut")}
    </button>
  );
}
