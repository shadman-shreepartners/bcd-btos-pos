/** YYYY-MM-DD in the user's local calendar (for `<input type="date">` min/max). */
export function formatLocalIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getTodayLocalDateString(): string {
  return formatLocalIsoDate(new Date());
}

export const DATE_MUST_BE_TODAY_OR_FUTURE =
  "Date must be today or in the future";

/** `iso` is YYYY-MM-DD from a date input. Non-matching strings return true so other validators can report format issues. */
export function isIsoDateOnOrAfterToday(isoDate: string): boolean {
  const t = isoDate.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return true;
  return t >= getTodayLocalDateString();
}
