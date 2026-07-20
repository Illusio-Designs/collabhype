import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';

async function bootstrap() {
  // Note: reference-data + admin seeding is triggered in app.js (on module
  // load) so it runs regardless of the host's entry file.
  const server = app.listen(env.PORT, () => {
    console.log(`[collabhype-api] ready on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });

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
