-- Soft-delete lifecycle fields on User
ALTER TABLE `User`
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `purgedAt`  DATETIME(3) NULL;

CREATE INDEX `User_deletedAt_idx` ON `User`(`deletedAt`);
