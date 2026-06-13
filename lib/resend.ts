import { Resend } from "resend";
import { config } from "@/lib/config";

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY ?? "");
  }
  return _resend;
}

const DOMAIN = config.app.domain;

export const FROM_EMAIL     = `${config.app.name} <noreply@${DOMAIN}>`;
export const FROM_CONTACT   = `${config.app.name} <contact@${DOMAIN}>`;
export const FROM_REMINDERS = `${config.app.name} <rappels@${DOMAIN}>`;
export const FROM_ALERTS    = `${config.app.name} <alertes@${DOMAIN}>`;
