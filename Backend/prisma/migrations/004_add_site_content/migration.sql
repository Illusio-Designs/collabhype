-- CreateTable SiteContent
-- The SiteContent model existed in schema.prisma but was never migrated, so the
-- admin "SEO & content" page 500s on a migrate-deploy'd database. IF NOT EXISTS
-- makes this safe on databases where it was already created via db push.
CREATE TABLE IF NOT EXISTS `SiteContent` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `ogImageUrl` VARCHAR(191) NULL,
    `body` LONGTEXT NULL,
    `data` JSON NULL,
    `isPublished` BOOLEAN NOT NULL DEFAULT true,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `SiteContent_slug_key`(`slug`),
    INDEX `SiteContent_isPublished_idx`(`isPublished`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
