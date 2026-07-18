import crypto from 'node:crypto';

// Collabhype order number: CH-<ts36>-<rand4>. "CH" = CollabHype. The base36
// timestamp keeps it lexicographically sortable and the random suffix +
// the DB unique constraint on Order.orderNumber make collisions effectively
// impossible.
export function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `CH-${ts}-${rand}`;
}
