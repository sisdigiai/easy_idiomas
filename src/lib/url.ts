// Defense against XSS via stored URL fields (materials.url, lessons.online_url,
// class_schedules.online_url). Even with the DB CHECK constraint blocking
// non-http(s) URLs, the front-end re-validates because:
//   1) the constraint can be bypassed by service-role inserts;
//   2) defense-in-depth — a regression in one layer is caught by the other.
//
// Reject schemes: javascript:, data:, vbscript:, file:, blob:, anything not http/https.
// Reject whitespace (URL spec forbids it; some browsers tolerate and execute).
const SAFE_URL_RE = /^https?:\/\/[^\s]+$/i;

export function isSafeExternalUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!SAFE_URL_RE.test(trimmed)) return false;
  // Belt-and-suspenders: parse and re-check the protocol.
  try {
    const u = new URL(trimmed);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}
