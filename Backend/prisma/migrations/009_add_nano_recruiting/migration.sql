-- Nano package recruiting: invited creators claim a slot until the target is met.
ALTER TABLE `Campaign` ADD COLUMN `isRecruiting` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `Campaign` ADD COLUMN `slotsTarget` INTEGER NULL;
ALTER TABLE `Campaign` ADD COLUMN `slotsFilled` INTEGER NOT NULL DEFAULT 0;
ALTER TABLE `Campaign` ADD COLUMN `taskNicheId` VARCHAR(191) NULL;
ALTER TABLE `Campaign` ADD COLUMN `taskDeliverables` JSON NULL;
ALTER TABLE `Campaign` ADD COLUMN `taskAmountPerUnit` DECIMAL(10, 2) NULL;
ALTER TABLE `Campaign` ADD COLUMN `taskPayoutPerUnit` DECIMAL(10, 2) NULL;

CREATE INDEX `Campaign_isRecruiting_idx` ON `Campaign`(`isRecruiting`);
