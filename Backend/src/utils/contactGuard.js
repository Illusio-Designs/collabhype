// Detects attempts to share personal contact details in negotiation chat.
// Tuned to avoid false positives in a RATE negotiation (prices/quantities are
// everywhere), so it only flags high-signal patterns: emails, URLs, long
// phone-like digit runs (10+), and explicit off-platform contact keywords.
// Short numbers like "8000" (a price) are NOT flagged.

const PATTERNS = [
  { name: 'email', re: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i },
  { name: 'url', re: /\b(?:https?:\/\/|www\.)\S+/i },
  // 10+ digits, allowing spaces/dashes/dots/() between them (phone numbers).
  { name: 'phone', re: /(?:\+?\d[\s().-]?){10,}/ },
  // Common off-platform channels / intent to move the conversation off-site.
  {
    name: 'offsite',
    re: /\b(whats\s?app|watsapp|wtsp|telegram|snapchat|signal app|gmail|hotmail|yahoo|proton\s?mail|\bdm\b|direct message|my (number|email|mail|contact)|call me|text me|message me on|contact me (on|at)|reach me (on|at))\b/i,
  },
  // Social handles (@name), but not email (handled above) — require it to look
  // like a standalone handle.
  { name: 'handle', re: /(^|\s)@[a-z0-9._]{3,}/i },
];

// Returns { blocked: boolean, reasons: string[] }.
export function scanForContact(text) {
  const s = String(text ?? '');
  const reasons = [];
  for (const p of PATTERNS) {
    if (p.re.test(s)) reasons.push(p.name);
  }
  return { blocked: reasons.length > 0, reasons };
}
