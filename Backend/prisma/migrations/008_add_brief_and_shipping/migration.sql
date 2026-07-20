-- Creator delivery address (for shipping products for reels/UGC)
ALTER TABLE `InfluencerProfile` ADD COLUMN `shippingAddress` TEXT NULL;
ALTER TABLE `InfluencerProfile` ADD COLUMN `pincode` VARCHAR(191) NULL;

-- Campaign brief attachments + sent marker
ALTER TABLE `Campaign` ADD COLUMN `productLink` VARCHAR(191) NULL;
ALTER TABLE `Campaign` ADD COLUMN `referenceImages` JSON NULL;
ALTER TABLE `Campaign` ADD COLUMN `briefSentAt` DATETIME(3) NULL;
