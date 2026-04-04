import { randomUUID } from "crypto";

export function generateGroupId(): string {
  return randomUUID();
}

function addInterval(date: Date, interval: string, customDays?: number | null): Date {
  const next = new Date(date);
  if (interval === "weekly") {
    next.setDate(next.getDate() + 7);
  } else if (interval === "monthly") {
    next.setMonth(next.getMonth() + 1);
  } else if (interval === "custom" && customDays) {
    next.setDate(next.getDate() + customDays);
  } else {
    next.setMonth(next.getMonth() + 1);
  }
  return next;
}

/**
 * Génère toutes les dates d'occurrence d'une transaction récurrente.
 * Commence à startDate, jusqu'à 12 mois dans le futur.
 * Inclut la date de départ (première occurrence).
 */
export function generateOccurrenceDates(
  startDate: Date,
  interval: string,
  customDays?: number | null,
  monthsAhead: number = 12
): Date[] {
  const dates: Date[] = [];
  const ceiling = new Date(startDate);
  ceiling.setMonth(ceiling.getMonth() + monthsAhead);

  let current = new Date(startDate);
  while (current <= ceiling) {
    dates.push(new Date(current));
    current = addInterval(current, interval, customDays);
  }

  return dates;
}
