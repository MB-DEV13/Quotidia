import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Resend } from "resend";
import { sendPushToUser } from "@/lib/push";
import { FROM_REMINDERS } from "@/lib/resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function verifyCron(req: Request) {
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: Request) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Récupère tous les users avec rappels activés ET des habitudes quotidiennes
  const users = await db.user.findMany({
    where: { dailyReminderEnabled: true },
    select: {
      id: true,
      email: true,
      name: true,
      habits: {
        where: { isArchived: false, frequency: "daily" },
        select: {
          id: true,
          name: true,
          icon: true,
          currentStreak: true,
          completions: {
            where: { date: { gte: today } },
            select: { id: true },
          },
        },
      },
    },
  });

  let sent = 0;

  for (const user of users) {
    const uncompleted = user.habits.filter((h) => h.completions.length === 0);
    if (uncompleted.length === 0) continue;

    const habitsList = uncompleted
      .map((h) => `${h.icon ?? "✅"} ${h.name}${h.currentStreak > 0 ? ` (streak ${h.currentStreak}j)` : ""}`)
      .join("<br/>");

    const title = `⏰ ${uncompleted.length} habitude${uncompleted.length > 1 ? "s" : ""} à valider aujourd'hui`;
    const body = `Ne brise pas ton streak ! ${uncompleted.map((h) => h.name).join(", ")}`;

    // Email
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: FROM_REMINDERS,
        to: user.email,
        subject: title,
        html: `
          <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;background:#F5F3FF;padding:24px;border-radius:16px;">
            <div style="text-align:center;margin-bottom:20px;">
              <span style="font-size:40px;">⏰</span>
              <h2 style="color:#5B5EA6;margin:8px 0 4px;">Rappel du soir</h2>
              <p style="color:#888;font-size:14px;">Il est encore temps de valider tes habitudes !</p>
            </div>
            <div style="background:#fff;border-radius:12px;padding:16px;margin-bottom:16px;">
              <p style="font-weight:600;color:#2D2D2D;margin:0 0 12px;">Habitudes restantes :</p>
              <p style="color:#2D2D2D;font-size:14px;line-height:1.8;margin:0;">${habitsList}</p>
            </div>
            <div style="text-align:center;">
              <a href="https://myquotidia.app/habits" style="background:#5B5EA6;color:#fff;text-decoration:none;padding:12px 28px;border-radius:12px;font-weight:600;font-size:14px;display:inline-block;">
                Valider mes habitudes →
              </a>
            </div>
            <p style="text-align:center;color:#888;font-size:11px;margin-top:20px;">
              Tu reçois cet email car tu as activé les rappels dans tes paramètres.<br/>
              <a href="https://myquotidia.app/settings" style="color:#5B5EA6;">Gérer mes notifications</a>
            </p>
          </div>
        `,
      });
    }

    // Push mobile
    await sendPushToUser(user.id, { title, body, url: "/habits" });
    sent++;
  }

  return NextResponse.json({ success: true, sent });
}
