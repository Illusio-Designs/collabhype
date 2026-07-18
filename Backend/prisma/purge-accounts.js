// Permanently purge soft-deleted accounts past the 30-day recovery window.
//
// "Permanent" here means ANONYMIZE, not hard-delete: personal data is scrubbed
// but the account row, fullName (name), payouts (payment records) and
// deliverables (work history) are kept for accounting/audit. Hard-deleting the
// user would cascade those away, which we must not do.
//
// Run daily from cron, e.g. (cPanel Cron Jobs):
//   cd /home/collabhype/Backend && node prisma/purge-accounts.js >> logs/purge.log 2>&1

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const RETENTION_DAYS = 30;

async function main() {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const due = await prisma.user.findMany({
    where: {
      isActive: false,
      purgedAt: null,
      deletedAt: { not: null, lte: cutoff },
    },
    select: { id: true },
  });

  if (!due.length) {
    console.log(`[purge] Nothing past the ${RETENTION_DAYS}-day window.`);
    return;
  }
  console.log(`[purge] Anonymizing ${due.length} account(s) past ${RETENTION_DAYS} days…`);

  for (const u of due) {
    await prisma.$transaction(async (tx) => {
      // User: scrub PII, keep fullName. Free up unique email/phone.
      await tx.user.update({
        where: { id: u.id },
        data: {
          email: `deleted-${u.id}@collabhype.invalid`,
          phone: null,
          avatarUrl: null,
          passwordHash: 'PURGED',
          purgedAt: new Date(),
        },
      });

      // Influencer: scrub profile PII and drop social connections (tokens +
      // handles). Keep the profile row so payouts/deliverables stay linked.
      const inf = await tx.influencerProfile.findUnique({
        where: { userId: u.id },
        select: { id: true },
      });
      if (inf) {
        await tx.socialAccount.deleteMany({ where: { influencerId: inf.id } });
        await tx.influencerProfile.update({
          where: { id: inf.id },
          data: {
            bio: null,
            city: null,
            state: null,
            upiId: null,
            bankAccountJson: null,
            razorpayContactId: null,
            razorpayFundAccountId: null,
            isAvailable: false,
          },
        });
      }

      // Brand: scrub profile PII, keep companyName (it appears on orders).
      const brand = await tx.brandProfile.findUnique({
        where: { userId: u.id },
        select: { id: true },
      });
      if (brand) {
        await tx.brandProfile.update({
          where: { id: brand.id },
          data: { website: null, gstin: null, logoUrl: null, about: null },
        });
      }
    });
    console.log(`[purge]   ✓ ${u.id}`);
  }
  console.log('[purge] Done.');
}

main()
  .catch((e) => {
    console.error('[purge] Failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
