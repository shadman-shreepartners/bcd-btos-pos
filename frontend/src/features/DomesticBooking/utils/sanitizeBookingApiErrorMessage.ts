const GENERIC = "Failed to create booking. Please try again.";

const MAX_LEN = 320;

/**
 * Returns a short, user-safe message for inline UI. Rejects verbose HTML/stack-like responses
 * that sometimes appear in error bodies.
 */
export function sanitizeBookingApiErrorMessage(raw: string): string {
  const s = raw.replace(/\s+/g, " ").trim();
  if (!s || s.length > MAX_LEN) return GENERIC;
  if (/<!doctype\b|<\s*html\b|<\s*body\b/i.test(s)) return GENERIC;
  if (/node_modules|[\\/]\.vite[\\/]|\bat\s+\S+\s*\([^)]*:\d+:\d+\)/i.test(s))
    return GENERIC;
  return s;
}
