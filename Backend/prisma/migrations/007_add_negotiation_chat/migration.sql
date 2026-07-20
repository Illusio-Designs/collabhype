-- Negotiation chat consent + strike counter on User
ALTER TABLE `User` ADD COLUMN `chatConsentAt` DATETIME(3) NULL;
ALTER TABLE `User` ADD COLUMN `chatStrikes` INTEGER NOT NULL DEFAULT 0;

-- Conversation
CREATE TABLE IF NOT EXISTS `Conversation` (
    `id` VARCHAR(191) NOT NULL,
    `brandUserId` VARCHAR(191) NOT NULL,
    `influencerId` VARCHAR(191) NOT NULL,
    `creatorUserId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    `lastMessageAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Conversation_brandUserId_influencerId_key`(`brandUserId`, `influencerId`),
    INDEX `Conversation_brandUserId_idx`(`brandUserId`),
    INDEX `Conversation_creatorUserId_idx`(`creatorUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ChatMessage
CREATE TABLE IF NOT EXISTS `ChatMessage` (
    `id` VARCHAR(191) NOT NULL,
    `conversationId` VARCHAR(191) NOT NULL,
    `senderUserId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'TEXT',
    `body` TEXT NULL,
    `deliverable` VARCHAR(191) NULL,
    `price` DECIMAL(10, 2) NULL,
    `offerStatus` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ChatMessage_conversationId_createdAt_idx`(`conversationId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_brandUserId_fkey` FOREIGN KEY (`brandUserId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_influencerId_fkey` FOREIGN KEY (`influencerId`) REFERENCES `InfluencerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ChatMessage` ADD CONSTRAINT `ChatMessage_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `Conversation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
