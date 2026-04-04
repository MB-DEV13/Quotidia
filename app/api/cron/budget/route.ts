import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Resend } from "resend";
import { sendPushToUser } from "@/lib/push";
import { FROM_ALERTS } from "@/lib/resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function verifyCron(req: Request) {
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: Request) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const configs = await db.budgetConfig.findMany({
    where: { configured: true, monthlyBudget: { gt: 0 } },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          expenses: {
            where: { date: { gte: startOfMonth } },
            select: { amount: true },
          },
        },
      },
    },
  });

  let sent = 0;

  for (const config of configs) {
    const totalSpent = config.user.expenses.reduce((s, e) => s + e.amount, 0);
    const ratio = totalSpent / config.monthlyBudget;

    if (ratio < 0.8) continue;

    // Ne pas envoyer 2 fois dans le même mois
    if (config.budgetAlertSentAt) {
      const alertMonth = `${config.budgetAlertSentAt.getFullYear()}-${String(config.budgetAlertSentAt.getMonth() + 1).padStart(2, "0")}`;
      if (alertMonth === thisMonth) continue;
    }

    const percent = Math.round(ratio * 100);
    const spent = totalSpent.toFixed(2);
    const budget = config.monthlyBudget.toFixed(2);
    const remaining = Math.max(0, config.monthlyBudget - totalSpent).toFixed(2);

    const title = ratio >= 1
      ? "🚨 Budget mensuel dépassé !"
      : `⚠️ Tu as utilisé ${percent}% de ton budget`;
    const body = ratio >= 1
      ? `Tu as dépensé ${spent}€ pour un budget de ${budget}€.`
      : `Il te reste ${remaining}€ sur ton budget mensuel de ${budget}€.`;

    // Email
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: FROM_ALERTS,
        to: config.user.email,
        subject: title,
        html: `
          <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;background:#F5F3FF;padding:24px;border-radius:16px;">
            <div style="text-align:center;margin-bottom:20px;">
              <span style="font-size:40px;">${ratio >= 1 ? "🚨" : "⚠️"}</span>
              <h2 style="color:#5B5EA6;margin:8px 0 4px;">Alerte budget</h2>
            </div>
            <div style="background:#fff;border-radius:12px;padding:16px;margin-bottom:16px;">
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                <span style="color:#888;font-size:14px;">Dépensé ce mois</span>
                <span style="font-weight:700;color:#EF4444;">${spent}€</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
                <span style="color:#888;font-size:14px;">Budget mensuel</span>
                <span style="font-weight:700;color:#2D2D2D;">${budget}€</span>
              </div>
              <div style="background:#f3f4f6;border-radius:8px;height:10px;overflow:hidden;">
                <div style="background:${ratio >= 1 ? "#EF4444" : "#FF9800"};width:${Math.min(100, percent)}%;height:100%;border-radius:8px;"></div>
              </div>
              <p style="color:#888;font-size:12px;text-align:right;margin:4px 0 0;">${percent}% utilisé</p>
            </div>
            <div style="text-align:center;">
              <a href="https://myquotidia.app/budget" style="background:#5B5EA6;color:#fff;text-decoration:none;padding:12px 28px;border-radius:12px;font-weight:600;font-size:14px;display:inline-block;">
                Voir mon budget →
              </a>
            </div>
            <p style="text-align:center;color:#888;font-size:11px;margin-top:20px;">
              <a href="https://myquotidia.app/settings" style="color:#5B5EA6;">Gérer mes notifications</a>
            </p>
          </div>
        `,
      });
    }

    // Push mobile
    await sendPushToUser(config.user.id, { title, body, url: "/budget" });

    // Marquer l'alerte comme envoyée
    await db.budgetConfig.update({
      where: { id: config.id },
      data: { budgetAlertSentAt: now },
    });

    sent++;
  }

  return NextResponse.json({ success: true, sent });
}
