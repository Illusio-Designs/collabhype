import crypto from 'node:crypto';

// Human-friendly, lexicographically-sortable, collision-resistant: CC-<ts36>-<rand4>
export function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `CC-${ts}-${rand}`;
}
