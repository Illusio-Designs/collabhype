import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

// Regenerate the Prisma Client when schema.prisma changed since the last
// generate. This module is imported (for its side effect) BEFORE @prisma/client
// in lib/prisma.js, and runs synchronously (execSync) — no top-level await — so
// it works under CommonJS loaders like LiteSpeed's lsnode that require() the
// ESM graph. Disable with AUTO_PRISMA_GENERATE=false.
const here = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(here, '../..');
const schemaPath = path.join(backendRoot, 'prisma', 'schema.prisma');
const markerPath = path.join(backendRoot, 'node_modules', '.prisma', '.ch-schema-hash');

if (String(process.env.AUTO_PRISMA_GENERATE ?? 'true').toLowerCase() !== 'false') {
  try {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    const hash = crypto.createHash('sha1').update(schema).digest('hex');
    let prev = null;
    try {
      prev = fs.readFileSync(markerPath, 'utf8');
    } catch {
      /* no marker yet */
    }
    if (prev !== hash) {
      console.log('[prisma] schema changed — regenerating client…');
      execSync('npx prisma generate', { cwd: backendRoot, stdio: 'ignore' });
      fs.mkdirSync(path.dirname(markerPath), { recursive: true });
      fs.writeFileSync(markerPath, hash);
      console.log('[prisma] client regenerated.');
    }
  } catch (e) {
    console.error(
      '[prisma] auto-generate skipped (run `npx prisma generate` manually):',
      e.message,
    );
  }
}
