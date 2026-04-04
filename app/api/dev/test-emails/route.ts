import { NextResponse } from "next/server";
import { Resend } from "resend";
import { weeklyReportHtml, monthlyReportHtml } from "@/lib/email-templates";

const TO = "onboarding@resend.dev";
const FROM = "Quotidia <onboarding@resend.dev>";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Dev only" }, { status: 403 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const appUrl = "https://myquotidia.app";

  const results = await Promise.allSettled([

    // 1. Reset mot de passe
    resend.emails.send({
      from: FROM, to: TO,
      subject: "Réinitialisation de ton mot de passe — Quotidia",
      html: `
        <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#F5F3FF;border-radius:16px;">
          <div style="text-align:center;margin-bottom:24px;">
            <span style="font-size:32px;">🌀</span>
            <h1 style="color:#5B5EA6;font-size:20px;margin:8px 0 0;">Quotidia</h1>
          </div>
          <div style="background:white;border-radius:16px;padding:28px;">
            <h2 style="color:#2D2D2D;font-size:18px;margin:0 0 12px;">Réinitialisation du mot de passe</h2>
            <p style="color:#888;font-size:14px;line-height:1.6;margin:0 0 24px;">
              Tu as demandé à réinitialiser ton mot de passe. Clique sur le bouton ci-dessous — ce lien est valable <strong>1 heure</strong>.
            </p>
            <div style="text-align:center;margin:24px 0;">
              <a href="${appUrl}/reset-password?token=TEST" style="display:inline-block;background:linear-gradient(135deg,#5B5EA6,#9B72CF);color:white;font-weight:600;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">
                Réinitialiser mon mot de passe →
              </a>
            </div>
            <p style="color:#aaa;font-size:12px;margin:16px 0 0;text-align:center;">
              Si tu n'as pas fait cette demande, ignore cet email.
            </p>
          </div>
          <p style="color:#bbb;font-size:11px;text-align:center;margin-top:20px;">
            © ${new Date().getFullYear()} Quotidia — Ton quotidien, en mieux.
          </p>
        </div>
      `,
    }),

    // 2. Rappel habitudes
    resend.emails.send({
      from: FROM, to: TO,
      subject: "⏰ 3 habitudes à valider aujourd'hui !",
      html: `
        <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;background:#F5F3FF;padding:24px;border-radius:16px;">
          <div style="text-align:center;margin-bottom:20px;">
            <span style="font-size:40px;">⏰</span>
            <h2 style="color:#5B5EA6;margin:8px 0 4px;">Rappel du soir</h2>
            <p style="color:#888;font-size:14px;">Il est encore temps de valider tes habitudes !</p>
          </div>
          <div style="background:#fff;border-radius:12px;padding:16px;margin-bottom:16px;">
            <p style="font-weight:600;color:#2D2D2D;margin:0 0 12px;">Habitudes restantes :</p>
            <p style="color:#2D2D2D;font-size:14px;line-height:1.8;margin:0;">
              🏃 Sport (streak 12j)<br/>
              📚 Lecture (streak 5j)<br/>
              🧘 Méditation
            </p>
          </div>
          <div style="text-align:center;">
            <a href="${appUrl}/habits" style="background:#5B5EA6;color:#fff;text-decoration:none;padding:12px 28px;border-radius:12px;font-weight:600;font-size:14px;display:inline-block;">
              Valider mes habitudes →
            </a>
          </div>
          <p style="text-align:center;color:#888;font-size:11px;margin-top:20px;">
            Tu reçois cet email car tu as activé les rappels dans tes paramètres.<br/>
            <a href="${appUrl}/settings" style="color:#5B5EA6;">Gérer mes notifications</a>
          </p>
        </div>
      `,
    }),

    // 3. Alerte budget
    resend.emails.send({
      from: FROM, to: TO,
      subject: "⚠️ Tu as utilisé 83% de ton budget",
      html: `
        <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;background:#F5F3FF;padding:24px;border-radius:16px;">
          <div style="text-align:center;margin-bottom:20px;">
            <span style="font-size:40px;">⚠️</span>
            <h2 style="color:#5B5EA6;margin:8px 0 4px;">Alerte budget</h2>
          </div>
          <div style="background:#fff;border-radius:12px;padding:16px;margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span style="color:#888;font-size:14px;">Dépensé ce mois</span>
              <span style="font-weight:700;color:#EF4444;">1 245,00 €</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
              <span style="color:#888;font-size:14px;">Budget mensuel</span>
              <span style="font-weight:700;color:#2D2D2D;">1 500,00 €</span>
            </div>
            <div style="background:#f3f4f6;border-radius:8px;height:10px;overflow:hidden;">
              <div style="background:#FF9800;width:83%;height:100%;border-radius:8px;"></div>
            </div>
            <p style="color:#888;font-size:12px;text-align:right;margin:4px 0 0;">83% utilisé</p>
          </div>
          <div style="text-align:center;">
            <a href="${appUrl}/budget" style="background:#5B5EA6;color:#fff;text-decoration:none;padding:12px 28px;border-radius:12px;font-weight:600;font-size:14px;display:inline-block;">
              Voir mon budget →
            </a>
          </div>
          <p style="text-align:center;color:#888;font-size:11px;margin-top:20px;">
            <a href="${appUrl}/settings" style="color:#5B5EA6;">Gérer mes notifications</a>
          </p>
        </div>
      `,
    }),

    // 4. Bilan hebdomadaire
    resend.emails.send({
      from: FROM, to: TO,
      subject: "📊 Ton bilan de la semaine — Quotidia",
      html: weeklyReportHtml({
        userName: "Mario",
        weekLabel: "24 – 30 mars 2026",
        completionRate: 78,
        totalCompleted: 18,
        totalPossible: 23,
        bestHabit: { name: "Sport", icon: "🏃", count: 5 },
        bestStreak: 12,
        xpGained: 320,
        budgetTotal: 420,
        budgetLimit: 500,
        goalsProgress: [
          { title: "Épargner 1 000 €", pct: 65 },
          { title: "Lire 12 livres", pct: 33 },
        ],
        motivationMessage: "Super semaine ! Tu maintiens un excellent rythme. Continue comme ça et tu atteindras ton streak de 30 jours dans 18 jours. 🔥",
        appUrl,
      }),
    }),

    // 5. Bilan mensuel
    resend.emails.send({
      from: FROM, to: TO,
      subject: "🗓️ Ton bilan de Mars 2026 — Quotidia",
      html: monthlyReportHtml({
        userName: "Mario",
        monthLabel: "Mars 2026",
        completionRate: 82,
        totalCompleted: 74,
        totalPossible: 90,
        bestStreak: 14,
        totalXp: 2850,
        level: 7,
        budgetTotal: 1245,
        budgetLimit: 1500,
        topCategory: { name: "Alimentation", amount: 380 },
        goalsCompleted: 1,
        goalsTotal: 3,
        badgesEarned: [
          { name: "Semaine Parfaite", icon: "🔥" },
          { name: "Objectif Atteint", icon: "🎯" },
        ],
        motivationMessage: "Excellent mois de Mars ! Tu as complété 82% de tes habitudes et débloqué 2 nouveaux badges. Avril s'annonce encore meilleur ! 🚀",
        appUrl,
      }),
    }),

  ]);

  const summary = results.map((r, i) => ({
    email: ["Reset mot de passe", "Rappel habitudes", "Alerte budget", "Bilan hebdo", "Bilan mensuel"][i],
    status: r.status,
    ...(r.status === "rejected" ? { error: String(r.reason) } : {}),
  }));

  return NextResponse.json({ sent: summary });
}
