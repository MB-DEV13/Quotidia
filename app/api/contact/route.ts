import { NextResponse } from "next/server";
import { z } from "zod";
import { FROM_CONTACT } from "@/lib/resend";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(10),
});

function escapeHtml(str: string) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: FROM_CONTACT,
        to: process.env.CONTACT_EMAIL ?? "contact@myquotidia.app",
        subject: `[Contact] ${escapeHtml(data.subject)}`,
        html: `
          <h2>Nouveau message de contact</h2>
          <p><strong>Nom :</strong> ${escapeHtml(data.name)}</p>
          <p><strong>Email :</strong> ${escapeHtml(data.email)}</p>
          <p><strong>Sujet :</strong> ${escapeHtml(data.subject)}</p>
          <hr />
          <p>${escapeHtml(data.message).replace(/\n/g, "<br/>")}</p>
        `,
      });
    } else {
      // Email non configuré — log serveur uniquement
      console.log("[CONTACT]", { ...data, date: new Date().toISOString() });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CONTACT ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'envoi" },
      { status: 500 }
    );
  }
}
