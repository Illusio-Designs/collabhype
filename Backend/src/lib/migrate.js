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
    msg.includes('duplicate key name') ||
    msg.includes('duplicate foreign key') || // re-adding an existing FK constraint
    msg.includes('multiple primary key') ||
    msg.includes("can't drop") ||
    msg.includes('check that column') ||
    // MySQL errnos: 1050 table exists, 1060 dup column, 1061 dup key,
    // 1022 dup key, 1826 dup FK, 1091 can't drop (doesn't exist).
    /\b(1050|1060|1061|1022|1826|1091)\b/.test(msg)
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
      let ok = true;
      for (const stmt of splitSql(sql)) {
        try {
          await prisma.$executeRawUnsafe(stmt);
        } catch (e) {
          if (isAlreadyExists(e)) continue; // benign: object already there
          console.error(`[migrate] ${dir}: statement failed:`, e.message);
          ok = false;
          break;
        }
      }
      if (ok) {
        await prisma.$executeRawUnsafe(
          'INSERT IGNORE INTO `_ch_migrations` (`name`) VALUES (?)',
          dir,
        );
        console.log(`[migrate] applied ${dir}`);
      } else {
        // Don't mark applied — retry next boot. Continue to later migrations so
        // one failure doesn't block independent tables the app needs.
        console.warn(`[migrate] ${dir} not fully applied; will retry next boot`);
      }
    }
  } catch (e) {
    console.error('[migrate] runner failed (continuing to boot):', e.message);
  }
}
