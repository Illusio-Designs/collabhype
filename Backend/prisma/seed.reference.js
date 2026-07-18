// =============================================================================
// Reference-only seed — safe to run against PRODUCTION.
//
// Seeds ONLY the catalog reference data the app needs to function:
//   - Niches (drive the profile niche selector + browse filters)
//   - Nano packages (the marketplace catalog)
//
// It creates NO demo users, creators, socials, or site content — so running it
// on live never pollutes the platform with fake accounts.
//
// Idempotent: every write is an upsert keyed on slug, so re-running is safe.
// The same data seeds automatically on server startup (see ensureSeedData);
// this script is for running it on demand.
//
//   node prisma/seed.reference.js   (or: npm run prisma:seed:reference)
// =============================================================================
import { PrismaClient } from '@prisma/client';
import { seedReferenceData } from '../src/lib/referenceSeed.js';

const prisma = new PrismaClient();

seedReferenceData(prisma)
  .then(async (res) => {
    console.log(`✓ Seeded ${res.niches} niches and ${res.packages} Nano packs`);
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error('Reference seed failed:', err);
    await prisma.$disconnect();
    process.exit(1);
  });
