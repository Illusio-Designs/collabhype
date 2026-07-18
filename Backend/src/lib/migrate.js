import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.resolve(here, '../../prisma/migrations');

// Split a migration file into individual statements. Drops full-line SQL
// comments, then splits on ';'. The migration files are plain DDL with no
// semicolons inside string literals, so this is safe.
function splitSql(sql) {
  return sql
    .split('\n')
    .filter((line) => !/^\s*--/.test(line))
    .join('\n')
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

// True when the error is a benign "object already exists" (table/column/index),
// which happens when a migration's objects were created another way (e.g. an
// earlier db push) before this runner tracked them.
function isAlreadyExists(e) {
  const msg = `${e?.message ?? ''} ${e?.meta?.message ?? ''}`.toLowerCase();
  return (
    msg.includes('already exists') ||
    msg.includes('duplicate column name') ||
    msg.includes('duplicate key name')
  );
}

// Apply any migration folders that haven't been applied yet, tracked in a
// `_ch_migrations` table. Idempotent and safe to run on every boot: applied
// migrations are skipped, and "already exists" errors are tolerated so it
// converges even on a database that was partially created another way.
//
// Runs automatically on startup (see app.js). Disable with AUTO_MIGRATE=false.
export async function runPendingMigrations(prisma) {
  if (String(process.env.AUTO_MIGRATE ?? 'true').toLowerCase() === 'false') return;
  if (!fs.existsSync(MIGRATIONS_DIR)) return;

  try {
    await prisma.$executeRawUnsafe(
      'CREATE TABLE IF NOT EXISTS `_ch_migrations` (' +
        '`name` VARCHAR(191) NOT NULL, ' +
        '`appliedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), ' +
        'PRIMARY KEY (`name`)) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;',
    );

    const rows = await prisma.$queryRawUnsafe('SELECT `name` FROM `_ch_migrations`');
    const applied = new Set(rows.map((r) => r.name));

    const dirs = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((d) => fs.existsSync(path.join(MIGRATIONS_DIR, d, 'migration.sql')))
      .sort();

    for (const dir of dirs) {
      if (applied.has(dir)) continue;
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, dir, 'migration.sql'), 'utf8');
      try {
        for (const stmt of splitSql(sql)) {
          try {
            await prisma.$executeRawUnsafe(stmt);
          } catch (e) {
            if (!isAlreadyExists(e)) throw e;
          }
        }
        await prisma.$executeRawUnsafe(
          'INSERT IGNORE INTO `_ch_migrations` (`name`) VALUES (?)',
          dir,
        );
        console.log(`[migrate] applied ${dir}`);
      } catch (e) {
        // Stop on a real failure so we don't apply later migrations on top of a
        // broken state; surfaced in logs for the operator.
        console.error(`[migrate] ${dir} failed, stopping:`, e.message);
        break;
      }
    }
  } catch (e) {
    console.error('[migrate] runner failed (continuing to boot):', e.message);
  }
}
