import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';
import { ensureSeedData } from './lib/referenceSeed.js';

async function bootstrap() {
  const server = app.listen(env.PORT, () => {
    console.log(`[collabhype-api] ready on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });

  // Seed reference data (niches + packages) the first time the DB is empty, and
  // provision the super-admin if its env creds are set. Idempotent and cheap on
  // later boots; never blocks or crashes startup (AUTO_SEED=false disables it).
  void ensureSeedData(prisma);

  const shutdown = async (signal) => {
    console.log(`\n[collabhype-api] received ${signal}, shutting down`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  console.error('[bootstrap] fatal', err);
  process.exit(1);
});
