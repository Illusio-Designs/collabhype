// Detects attempts to share personal contact details in negotiation chat.
// Tuned to avoid false positives in a RATE negotiation (prices/quantities are
// everywhere), so it only flags high-signal patterns: emails, URLs, long
// phone-like digit runs (10+), and explicit off-platform contact keywords.
// Short numbers like "8000" (a price) are NOT flagged.

const PATTERNS = [
  { name: 'email', re: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i },
  { name: 'url', re: /\b(?:https?:\/\/|www\.)\S+/i },
  // A phone number: a contiguous run of 10+ digits (e.g. 9876543210), or an
  // explicitly international +country-code number. Deliberately does NOT flag
  // several space-separated short numbers — "Budget: 50000 50000 40000" is
  // price talk, not a phone number, and must never trip the strike system.
  { name: 'phone', re: /\d{10,}|\+\d[\d\s().-]{8,}\d/ },
  // Common off-platform channels / intent to move the conversation off-site.
  // `my number` is guarded so "my number of reels/posts" is NOT flagged.
  {
    name: 'offsite',
    re: /\b(whats\s?app|watsapp|wtsp|telegram|snapchat|signal app|gmail|hotmail|yahoo|proton\s?mail|dm|direct message|my (mobile|phone|cell|email|mail|contact)|call me|text me|message me on|contact me (on|at)|reach me (on|at))\b|\bmy number\b(?!\s+of)/i,
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
