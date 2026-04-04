// ─── Helpers ───────────────────────────────────────────────────────────────

function base(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #F5F3FF; color: #2D2D2D; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 32px 16px; }
    .card { background: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .logo { font-size: 22px; font-weight: 800; color: #5B5EA6; margin-bottom: 24px; }
    h1 { font-size: 22px; font-weight: 700; margin-bottom: 8px; }
    .subtitle { color: #888; font-size: 14px; margin-bottom: 28px; }
    .stat-row { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .stat { flex: 1; min-width: 120px; background: #F5F3FF; border-radius: 12px; padding: 16px; text-align: center; }
    .stat-value { font-size: 28px; font-weight: 800; color: #5B5EA6; }
    .stat-label { font-size: 12px; color: #888; margin-top: 4px; }
    .section { margin-top: 24px; }
    .section-title { font-size: 13px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
    .habit-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
    .habit-row:last-child { border-bottom: none; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 99px; font-size: 12px; font-weight: 600; }
    .badge-green { background: #e8f5e9; color: #4CAF50; }
    .badge-orange { background: #fff3e0; color: #FF9800; }
    .badge-purple { background: #ede7f6; color: #5B5EA6; }
    .progress-bar { background: #f0f0f0; border-radius: 8px; height: 8px; overflow: hidden; margin-top: 6px; }
    .progress-fill { background: linear-gradient(90deg, #5B5EA6, #9B72CF); height: 100%; border-radius: 8px; }
    .motivation { background: linear-gradient(135deg, #5B5EA6, #9B72CF); color: #fff; border-radius: 12px; padding: 20px; margin-top: 24px; }
    .motivation p { font-size: 15px; line-height: 1.6; }
    .cta { display: block; text-align: center; margin-top: 28px; }
    .cta a { display: inline-block; background: linear-gradient(135deg, #5B5EA6, #9B72CF); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 15px; }
    .footer { text-align: center; color: #aaa; font-size: 12px; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="logo">🌀 Quotidia</div>
      ${body}
    </div>
    <div class="footer">
      Tu reçois cet email car tu es inscrit sur Quotidia.<br />
      © ${new Date().getFullYear()} Quotidia — Ton quotidien, en mieux.
    </div>
  </div>
</body>
</html>`;
}

// ─── Bilan hebdomadaire ─────────────────────────────────────────────────────

interface WeeklyReportData {
  userName: string;
  weekLabel: string; // ex: "10 – 16 mars 2026"
  completionRate: number;
  totalCompleted: number;
  totalPossible: number;
  bestHabit: { name: string; icon: string | null; count: number } | null;
  bestStreak: number;
  xpGained: number;
  budgetTotal: number;
  budgetLimit: number | null;
  goalsProgress: { title: string; pct: number }[];
  motivationMessage: string;
  appUrl: string;
}

export function weeklyReportHtml(data: WeeklyReportData): string {
  const budgetSection =
    data.budgetLimit !== null
      ? `<div class="section">
          <div class="section-title">💰 Budget de la semaine</div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-weight:600;">${data.budgetTotal.toFixed(2)} € dépensés</span>
            <span class="badge ${data.budgetTotal > data.budgetLimit ? "badge-orange" : "badge-green"}">
              ${data.budgetTotal > data.budgetLimit ? "Dépassé" : "Dans les clous"}
            </span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${Math.min(data.budgetLimit > 0 ? Math.round((data.budgetTotal / data.budgetLimit) * 100) : 0, 100)}%"></div>
          </div>
          <p style="font-size:12px;color:#888;margin-top:6px;">Limite : ${data.budgetLimit.toFixed(2)} € / semaine</p>
        </div>`
      : "";

  const goalsSection =
    data.goalsProgress.length > 0
      ? `<div class="section">
          <div class="section-title">🎯 Objectifs en cours</div>
          ${data.goalsProgress
            .map(
              (g) => `
            <div style="margin-bottom:14px;">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                <span style="font-size:14px;font-weight:500;">${g.title}</span>
                <span style="font-size:13px;color:#5B5EA6;font-weight:700;">${g.pct}%</span>
              </div>
              <div class="progress-bar"><div class="progress-fill" style="width:${g.pct}%"></div></div>
            </div>`
            )
            .join("")}
        </div>`
      : "";

  const body = `
    <h1>Ton bilan de la semaine 📊</h1>
    <p class="subtitle">Semaine du ${data.weekLabel} · Bonjour ${data.userName} !</p>

    <div class="stat-row">
      <div class="stat">
        <div class="stat-value">${data.completionRate}%</div>
        <div class="stat-label">Complétion</div>
      </div>
      <div class="stat">
        <div class="stat-value">${data.totalCompleted}/${data.totalPossible}</div>
        <div class="stat-label">Habitudes</div>
      </div>
      <div class="stat">
        <div class="stat-value">${data.bestStreak}j</div>
        <div class="stat-label">Meilleur streak</div>
      </div>
      <div class="stat">
        <div class="stat-value">+${data.xpGained}</div>
        <div class="stat-label">XP gagnés</div>
      </div>
    </div>

    ${
      data.bestHabit
        ? `<div class="section">
        <div class="section-title">⭐ Meilleure habitude</div>
        <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#F5F3FF;border-radius:10px;">
          <span style="font-size:22px;">${data.bestHabit.icon ?? "✅"}</span>
          <div>
            <div style="font-weight:600;">${data.bestHabit.name}</div>
            <div style="font-size:12px;color:#888;">${data.bestHabit.count}x complétée cette semaine</div>
          </div>
        </div>
      </div>`
        : ""
    }

    ${budgetSection}
    ${goalsSection}

    <div class="motivation"><p>💬 ${data.motivationMessage}</p></div>

    <div class="cta"><a href="${data.appUrl}/dashboard">Voir mon dashboard →</a></div>
  `;

  return base(`Bilan de la semaine — ${data.weekLabel}`, body);
}

// ─── Email de bienvenue ─────────────────────────────────────────────────────

export function welcomeEmailHtml(name: string | null, appUrl: string): string {
  const firstName = name?.split(" ")[0] ?? "toi";
  return base("Bienvenue sur Quotidia 🌀", `
    <h1>Bienvenue, ${firstName} ! 🎉</h1>
    <p class="subtitle">Ton compte est prêt — voici par où commencer.</p>

    <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px;">
      <div style="display:flex;align-items:center;gap:12px;background:#F5F3FF;border-radius:12px;padding:14px;">
        <span style="font-size:24px;">✅</span>
        <div><strong style="font-size:14px;">Crée ta première habitude</strong><p style="font-size:13px;color:#888;margin:2px 0 0;">Construis des routines solides, jour après jour.</p></div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;background:#F5F3FF;border-radius:12px;padding:14px;">
        <span style="font-size:24px;">💰</span>
        <div><strong style="font-size:14px;">Configure ton budget</strong><p style="font-size:13px;color:#888;margin:2px 0 0;">Suis tes dépenses et visualise où va ton argent.</p></div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;background:#F5F3FF;border-radius:12px;padding:14px;">
        <span style="font-size:24px;">🎯</span>
        <div><strong style="font-size:14px;">Définis un objectif</strong><p style="font-size:13px;color:#888;margin:2px 0 0;">Avec une barre de progression et une deadline.</p></div>
      </div>
    </div>

    <div class="cta"><a href="${appUrl}/dashboard">Accéder à mon dashboard →</a></div>

    <p style="font-size:12px;color:#aaa;text-align:center;margin-top:20px;">
      Des questions ? Contacte-nous via <a href="${appUrl}/settings#contact" style="color:#9B72CF;">la page contact</a>.
    </p>
  `);
}

// ─── Confirmation Premium ────────────────────────────────────────────────────

export function premiumConfirmEmailHtml(name: string | null, periodEnd: Date, appUrl: string): string {
  const firstName = name?.split(" ")[0] ?? "toi";
  const endDate = periodEnd.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  return base("✨ Tu es Premium — merci !", `
    <div style="text-align:center;margin-bottom:20px;"><span style="font-size:56px;">🏆</span></div>
    <h1 style="text-align:center;">Bienvenue dans Premium, ${firstName} !</h1>
    <p class="subtitle" style="text-align:center;">Abonnement actif jusqu'au <strong style="color:#5B5EA6;">${endDate}</strong></p>

    <div style="background:#F5F3FF;border-radius:12px;padding:20px;margin-bottom:24px;">
      <div class="section-title">Ce que tu débloque</div>
      <div style="display:flex;flex-direction:column;gap:8px;font-size:14px;color:#444;">
        <div>🏦 Connexion bancaire automatique (Open Banking)</div>
        <div>🤖 Assistant IA sans limite</div>
        <div>📊 Statistiques sur 30 et 90 jours</div>
        <div>🏅 Badges exclusifs &amp; niveaux avancés</div>
        <div>🌙 Thème sombre</div>
        <div>📥 Export CSV de toutes tes données</div>
      </div>
    </div>

    <div class="cta"><a href="${appUrl}/dashboard">Découvrir mes nouvelles fonctionnalités →</a></div>

    <p style="font-size:12px;color:#aaa;text-align:center;margin-top:20px;">
      Gère ton abonnement depuis tes <a href="${appUrl}/settings" style="color:#9B72CF;">paramètres</a>.
    </p>
  `);
}

// ─── Abonnement annulé ───────────────────────────────────────────────────────

export function subscriptionCancelledEmailHtml(name: string | null, periodEnd: Date, appUrl: string): string {
  const firstName = name?.split(" ")[0] ?? "toi";
  const endDate = periodEnd.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  return base("Ton abonnement Premium se termine", `
    <h1>À bientôt, ${firstName}</h1>
    <p class="subtitle">Ton abonnement Premium a été annulé.</p>

    <div style="background:#fff3e0;border-radius:12px;padding:20px;margin-bottom:24px;border-left:4px solid #FF9800;">
      <p style="font-size:14px;color:#444;line-height:1.6;">
        Tu garderas accès à toutes les fonctionnalités Premium jusqu'au
        <strong style="color:#5B5EA6;">${endDate}</strong>.<br><br>
        Après cette date, ton compte passera en version gratuite.
        <strong>Tes données restent intactes.</strong>
      </p>
    </div>

    <div class="cta"><a href="${appUrl}/upgrade">Réactiver Premium →</a></div>

    <p style="font-size:12px;color:#aaa;text-align:center;margin-top:20px;">
      Tu changes d'avis ? Réabonne-toi à tout moment, sans perte de données.
    </p>
  `);
}

// ─── Bilan mensuel ──────────────────────────────────────────────────────────

interface MonthlyReportData {
  userName: string;
  monthLabel: string; // ex: "Mars 2026"
  completionRate: number;
  totalCompleted: number;
  totalPossible: number;
  bestStreak: number;
  totalXp: number;
  level: number;
  budgetTotal: number;
  budgetLimit: number | null;
  topCategory: { name: string; amount: number } | null;
  goalsCompleted: number;
  goalsTotal: number;
  badgesEarned: { name: string; icon: string }[];
  motivationMessage: string;
  appUrl: string;
}

export function monthlyReportHtml(data: MonthlyReportData): string {
  const budgetSection =
    data.budgetLimit !== null
      ? `<div class="section">
          <div class="section-title">💰 Budget du mois</div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-weight:600;">${data.budgetTotal.toFixed(2)} € dépensés</span>
            <span class="badge ${data.budgetTotal > data.budgetLimit ? "badge-orange" : "badge-green"}">
              ${data.budgetTotal > data.budgetLimit ? "Dépassé" : "Sous budget ✓"}
            </span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${Math.min(data.budgetLimit > 0 ? Math.round((data.budgetTotal / data.budgetLimit) * 100) : 0, 100)}%"></div>
          </div>
          ${
            data.topCategory
              ? `<p style="font-size:12px;color:#888;margin-top:6px;">Principale catégorie : <strong>${data.topCategory.name}</strong> (${data.topCategory.amount.toFixed(2)} €)</p>`
              : ""
          }
        </div>`
      : "";

  const badgesSection =
    data.badgesEarned.length > 0
      ? `<div class="section">
          <div class="section-title">🏅 Badges débloqués ce mois</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${data.badgesEarned
              .map(
                (b) =>
                  `<div style="background:#F5F3FF;border-radius:10px;padding:8px 14px;display:flex;align-items:center;gap:6px;">
                    <span style="font-size:18px;">${b.icon}</span>
                    <span style="font-size:13px;font-weight:600;">${b.name}</span>
                  </div>`
              )
              .join("")}
          </div>
        </div>`
      : "";

  const body = `
    <h1>Ton bilan de ${data.monthLabel} 🗓️</h1>
    <p class="subtitle">Bravo ${data.userName} — voici ce que tu as accompli ce mois !</p>

    <div class="stat-row">
      <div class="stat">
        <div class="stat-value">${data.completionRate}%</div>
        <div class="stat-label">Complétion</div>
      </div>
      <div class="stat">
        <div class="stat-value">${data.bestStreak}j</div>
        <div class="stat-label">Meilleur streak</div>
      </div>
      <div class="stat">
        <div class="stat-value">Niv. ${data.level}</div>
        <div class="stat-label">${data.totalXp} XP total</div>
      </div>
      <div class="stat">
        <div class="stat-value">${data.goalsCompleted}/${data.goalsTotal}</div>
        <div class="stat-label">Objectifs atteints</div>
      </div>
    </div>

    ${budgetSection}
    ${badgesSection}

    <div class="motivation"><p>💬 ${data.motivationMessage}</p></div>

    <div class="cta"><a href="${data.appUrl}/dashboard">Continuer sur Quotidia →</a></div>
  `;

  return base(`Bilan de ${data.monthLabel} — Quotidia`, body);
}
