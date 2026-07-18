import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.js';

// The generated Prisma Client lives in node_modules and is NOT deployed over
// FTP, so after a schema change the server keeps an old client that doesn't
// know the new models/fields (e.g. BlogPost, chatConsentAt) — every query on
// them throws. To keep deploys hands-off, regenerate the client on startup
// whenever schema.prisma has changed since the last generate. Runs BEFORE the
// client is imported (dynamic import below) so the fresh client is loaded.
// Disable with AUTO_PRISMA_GENERATE=false.
const here = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(here, '../..');
const schemaPath = path.join(backendRoot, 'prisma', 'schema.prisma');
const markerPath = path.join(backendRoot, 'node_modules', '.prisma', '.ch-schema-hash');

function ensureFreshClient() {
  if (String(process.env.AUTO_PRISMA_GENERATE ?? 'true').toLowerCase() === 'false') return;
  try {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    const hash = crypto.createHash('sha1').update(schema).digest('hex');
    let prev = null;
    try {
      prev = fs.readFileSync(markerPath, 'utf8');
    } catch {
      /* no marker yet */
    }
    if (prev === hash) return; // client already matches the current schema
    console.log('[prisma] schema changed — regenerating client…');
    execSync('npx prisma generate', { cwd: backendRoot, stdio: 'ignore' });
    fs.mkdirSync(path.dirname(markerPath), { recursive: true });
    fs.writeFileSync(markerPath, hash);
    console.log('[prisma] client regenerated.');
  } catch (e) {
    console.error('[prisma] auto-generate skipped (run `npx prisma generate` manually):', e.message);
  }
}

ensureFreshClient();

// Import AFTER a potential regenerate so the up-to-date client is loaded.
const { PrismaClient } = await import('@prisma/client');

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}
