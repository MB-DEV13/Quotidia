export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getStartOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getStartOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getEndOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

/**
 * Frequency format:
 *  "daily"           → every day
 *  "days:1,3,5"      → specific ISO days (1=Mon … 7=Sun)
 *  "once:2026-03-20" → single date (YYYY-MM-DD)
 */
export function isHabitScheduledToday(frequency: string): boolean {
  const today = new Date();
  if (frequency === "daily") return true;
  if (frequency.startsWith("days:")) {
    const isoDays = frequency.slice(5).split(",").map(Number);
    // JS getDay(): 0=Sun … 6=Sat → convert to ISO: Mon=1 … Sun=7
    const isoToday = today.getDay() === 0 ? 7 : today.getDay();
    return isoDays.includes(isoToday);
  }
  if (frequency.startsWith("once:")) {
    const dateStr = frequency.slice(5); // "YYYY-MM-DD"
    const todayStr = today.toISOString().slice(0, 10);
    return dateStr === todayStr;
  }
  return true; // fallback
}

export function getFrequencyLabel(frequency: string): string {
  if (frequency === "daily") return "Quotidienne";
  if (frequency.startsWith("days:")) {
    const dayNames = ["", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    const days = frequency.slice(5).split(",").map(Number);
    return days.map((d) => dayNames[d]).join(", ");
  }
  if (frequency.startsWith("once:")) {
    const [y, m, d] = frequency.slice(5).split("-");
    return `Le ${d}/${m}/${y}`;
  }
  return frequency;
}

export function getLast7Days(): Date[] {
  const days: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  return days;
}
