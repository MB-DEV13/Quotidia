import { Resend } from "resend";

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY ?? "");
  }
  return _resend;
}

const DOMAIN = process.env.EMAIL_DOMAIN ?? "quotidia.fr";

export const FROM_EMAIL    = `Quotidia <noreply@${DOMAIN}>`;
export const FROM_CONTACT  = `Quotidia <contact@${DOMAIN}>`;
export const FROM_REMINDERS = `Quotidia <rappels@${DOMAIN}>`;
export const FROM_ALERTS   = `Quotidia <alertes@${DOMAIN}>`;
