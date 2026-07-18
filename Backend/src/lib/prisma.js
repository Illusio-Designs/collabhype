// Import order matters: ensureClient runs `prisma generate` (synchronously) if
// the schema changed, BEFORE @prisma/client is loaded, so the fresh client is
// used. No top-level await here — this must stay require()-able under LiteSpeed.
import './ensureClient.js';
import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}
