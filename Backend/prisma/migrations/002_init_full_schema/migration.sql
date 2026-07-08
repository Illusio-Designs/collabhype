-- CreateTable User
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191),
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` ENUM('BRAND', 'INFLUENCER', 'ADMIN') NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `avatarUrl` VARCHAR(191),
    `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    `phoneVerified` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `lastLoginAt` DATETIME(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_phone_key`(`phone`),
    INDEX `User_role_idx`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable InfluencerProfile
CREATE TABLE `InfluencerProfile` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `bio` LONGTEXT,
    `city` VARCHAR(191),
    `state` VARCHAR(191),
    `country` VARCHAR(191) DEFAULT 'IN',
    `languages` VARCHAR(191),
    `gender` VARCHAR(191),
    `dob` DATETIME(3),
    `tier` ENUM('NANO', 'MICRO', 'MACRO', 'MEGA'),
    `totalFollowers` INTEGER NOT NULL DEFAULT 0,
    `avgEngagementRate` DOUBLE NOT NULL DEFAULT 0,
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    `baseRate` DECIMAL(10, 2),
    `upiId` VARCHAR(191),
    `bankAccountJson` JSON,
    `razorpayContactId` VARCHAR(191),
    `razorpayFundAccountId` VARCHAR(191),
    `badge` ENUM('NONE', 'RISING_TALENT', 'TOP_RATED', 'TOP_RATED_PLUS', 'EXPERT_VETTED') NOT NULL DEFAULT 'NONE',
    `completedCampaigns` INTEGER NOT NULL DEFAULT 0,
    `successfulDeliverables` INTEGER NOT NULL DEFAULT 0,
    `failedDeliverables` INTEGER NOT NULL DEFAULT 0,
    `revisionsRequested` INTEGER NOT NULL DEFAULT 0,
    `totalEarnings` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `successRate` FLOAT NOT NULL DEFAULT 0,
    `responseRate` FLOAT NOT NULL DEFAULT 0,
    `avgRating` FLOAT NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `InfluencerProfile_userId_key`(`userId`),
    INDEX `InfluencerProfile_tier_idx`(`tier`),
    INDEX `InfluencerProfile_city_idx`(`city`),
    INDEX `InfluencerProfile_isAvailable_idx`(`isAvailable`),
    INDEX `InfluencerProfile_badge_idx`(`badge`),
    CONSTRAINT `InfluencerProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable BrandProfile
CREATE TABLE `BrandProfile` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `website` VARCHAR(191),
    `industry` VARCHAR(191),
    `gstin` VARCHAR(191),
    `logoUrl` VARCHAR(191),
    `about` LONGTEXT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BrandProfile_userId_key`(`userId`),
    CONSTRAINT `BrandProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable SocialAccount
CREATE TABLE `SocialAccount` (
    `id` VARCHAR(191) NOT NULL,
    `influencerId` VARCHAR(191) NOT NULL,
    `platform` ENUM('INSTAGRAM', 'YOUTUBE', 'TIKTOK', 'X', 'FACEBOOK') NOT NULL,
    `handle` VARCHAR(191) NOT NULL,
    `externalId` VARCHAR(191),
    `profileUrl` VARCHAR(191),
    `followers` INTEGER NOT NULL DEFAULT 0,
    `following` INTEGER NOT NULL DEFAULT 0,
    `posts` INTEGER NOT NULL DEFAULT 0,
    `avgLikes` INTEGER NOT NULL DEFAULT 0,
    `avgComments` INTEGER NOT NULL DEFAULT 0,
    `engagementRate` DOUBLE NOT NULL DEFAULT 0,
    `accessToken` LONGTEXT,
    `refreshToken` LONGTEXT,
    `tokenExpiresAt` DATETIME(3),
    `lastSyncedAt` DATETIME(3),
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    CONSTRAINT `SocialAccount_influencerId_fkey` FOREIGN KEY (`influencerId`) REFERENCES `InfluencerProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable Niche
CREATE TABLE `Niche` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` LONGTEXT,
    `icon` VARCHAR(191),
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Niche_slug_key`(`slug`),
    INDEX `Niche_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable InfluencerNiche
CREATE TABLE `InfluencerNiche` (
    `id` VARCHAR(191) NOT NULL,
    `influencerId` VARCHAR(191) NOT NULL,
    `nicheId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `InfluencerNiche_influencerId_nicheId_key`(`influencerId`, `nicheId`),
    CONSTRAINT `InfluencerNiche_influencerId_fkey` FOREIGN KEY (`influencerId`) REFERENCES `InfluencerProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `InfluencerNiche_nicheId_fkey` FOREIGN KEY (`nicheId`) REFERENCES `Niche` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable RateCard
CREATE TABLE `RateCard` (
    `id` VARCHAR(191) NOT NULL,
    `influencerId` VARCHAR(191) NOT NULL,
    `deliverable` ENUM('IG_POST', 'IG_REEL', 'IG_STORY', 'IG_CAROUSEL', 'YT_VIDEO', 'YT_SHORT', 'UGC', 'STORE_VISIT', 'BLOG', 'UTM_LINK', 'VIDEO_DRIVE_LINK', 'PERFORMANCE_REPORT') NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,

    UNIQUE INDEX `RateCard_influencerId_deliverable_key`(`influencerId`, `deliverable`),
    CONSTRAINT `RateCard_influencerId_fkey` FOREIGN KEY (`influencerId`) REFERENCES `InfluencerProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable Package
CREATE TABLE `Package` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` LONGTEXT,
    `tier` ENUM('NANO', 'MICRO', 'MACRO', 'MEGA') NOT NULL,
    `nicheId` VARCHAR(191) NOT NULL,
    `basePrice` DECIMAL(12, 2) NOT NULL,
    `platformMarkupPercent` DECIMAL(5, 2) NOT NULL DEFAULT 5,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Package_slug_key`(`slug`),
    INDEX `Package_tier_idx`(`tier`),
    INDEX `Package_nicheId_idx`(`nicheId`),
    INDEX `Package_isActive_idx`(`isActive`),
    CONSTRAINT `Package_nicheId_fkey` FOREIGN KEY (`nicheId`) REFERENCES `Niche` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable PackageInfluencer
CREATE TABLE `PackageInfluencer` (
    `id` VARCHAR(191) NOT NULL,
    `packageId` VARCHAR(191) NOT NULL,
    `influencerId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `PackageInfluencer_packageId_influencerId_key`(`packageId`, `influencerId`),
    CONSTRAINT `PackageInfluencer_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `PackageInfluencer_influencerId_fkey` FOREIGN KEY (`influencerId`) REFERENCES `InfluencerProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable Cart
CREATE TABLE `Cart` (
    `id` VARCHAR(191) NOT NULL,
    `brandId` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Cart_brandId_key`(`brandId`),
    CONSTRAINT `Cart_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable CartItem
CREATE TABLE `CartItem` (
    `id` VARCHAR(191) NOT NULL,
    `cartId` VARCHAR(191) NOT NULL,
    `itemType` ENUM('PACKAGE', 'INFLUENCER') NOT NULL,
    `packageId` VARCHAR(191),
    `influencerId` VARCHAR(191),
    `qty` INTEGER NOT NULL DEFAULT 1,
    `pricePerUnit` DECIMAL(12, 2) NOT NULL,
    `deliverables` JSON,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    CONSTRAINT `CartItem_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `Cart` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `CartItem_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `CartItem_influencerId_fkey` FOREIGN KEY (`influencerId`) REFERENCES `InfluencerProfile` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable Order
CREATE TABLE `Order` (
    `id` VARCHAR(191) NOT NULL,
    `orderNumber` VARCHAR(191) NOT NULL,
    `brandId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'PAID', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `subtotal` DECIMAL(12, 2) NOT NULL,
    `platformFee` DECIMAL(12, 2) NOT NULL,
    `totalAmount` DECIMAL(12, 2) NOT NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'INR',
    `razorpayOrderId` VARCHAR(191),
    `razorpayPaymentId` VARCHAR(191),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Order_orderNumber_key`(`orderNumber`),
    UNIQUE INDEX `Order_razorpayOrderId_key`(`razorpayOrderId`),
    INDEX `Order_brandId_idx`(`brandId`),
    INDEX `Order_status_idx`(`status`),
    CONSTRAINT `Order_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable OrderItem
CREATE TABLE `OrderItem` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `itemType` ENUM('PACKAGE', 'INFLUENCER') NOT NULL,
    `packageId` VARCHAR(191),
    `influencerId` VARCHAR(191),
    `qty` INTEGER NOT NULL,
    `pricePerUnit` DECIMAL(12, 2) NOT NULL,
    `subtotal` DECIMAL(12, 2) NOT NULL,
    `deliverables` JSON,

    CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `OrderItem_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `OrderItem_influencerId_fkey` FOREIGN KEY (`influencerId`) REFERENCES `InfluencerProfile` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable Campaign
CREATE TABLE `Campaign` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `influencerId` VARCHAR(191) NOT NULL,
    `brief` LONGTEXT,
    `hashtags` VARCHAR(191),
    `dontList` LONGTEXT,
    `startDate` DATETIME(3),
    `endDate` DATETIME(3),
    `status` ENUM('DRAFT', 'BRIEF_SENT', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Campaign_orderId_idx`(`orderId`),
    INDEX `Campaign_influencerId_idx`(`influencerId`),
    INDEX `Campaign_status_idx`(`status`),
    CONSTRAINT `Campaign_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `Campaign_influencerId_fkey` FOREIGN KEY (`influencerId`) REFERENCES `InfluencerProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable CampaignDeliverable
CREATE TABLE `CampaignDeliverable` (
    `id` VARCHAR(191) NOT NULL,
    `campaignId` VARCHAR(191) NOT NULL,
    `influencerId` VARCHAR(191) NOT NULL,
    `type` ENUM('IG_POST', 'IG_REEL', 'IG_STORY', 'IG_CAROUSEL', 'YT_VIDEO', 'YT_SHORT', 'UGC', 'STORE_VISIT', 'BLOG', 'UTM_LINK', 'VIDEO_DRIVE_LINK', 'PERFORMANCE_REPORT') NOT NULL,
    `qty` INTEGER NOT NULL DEFAULT 1,
    `price` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('PENDING', 'DRAFT_SUBMITTED', 'REVISION_REQUESTED', 'APPROVED', 'POSTED', 'PAID') NOT NULL DEFAULT 'PENDING',
    `draftUrl` VARCHAR(191),
    `postedUrl` VARCHAR(191),
    `feedback` LONGTEXT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CampaignDeliverable_campaignId_idx`(`campaignId`),
    INDEX `CampaignDeliverable_influencerId_idx`(`influencerId`),
    INDEX `CampaignDeliverable_status_idx`(`status`),
    CONSTRAINT `CampaignDeliverable_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `CampaignDeliverable_influencerId_fkey` FOREIGN KEY (`influencerId`) REFERENCES `InfluencerProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable EscrowHold
CREATE TABLE `EscrowHold` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'INR',
    `status` ENUM('HELD', 'RELEASED', 'REFUNDED') NOT NULL DEFAULT 'HELD',
    `razorpayTransferId` VARCHAR(191),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `EscrowHold_orderId_key`(`orderId`),
    CONSTRAINT `EscrowHold_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable Payout
CREATE TABLE `Payout` (
    `id` VARCHAR(191) NOT NULL,
    `influencerId` VARCHAR(191) NOT NULL,
    `deliverableId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'INR',
    `status` ENUM('PENDING', 'PROCESSING', 'PAID', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `razorpayTransferId` VARCHAR(191),
    `failureReason` LONGTEXT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Payout_influencerId_idx`(`influencerId`),
    INDEX `Payout_deliverableId_idx`(`deliverableId`),
    INDEX `Payout_status_idx`(`status`),
    CONSTRAINT `Payout_influencerId_fkey` FOREIGN KEY (`influencerId`) REFERENCES `InfluencerProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `Payout_deliverableId_fkey` FOREIGN KEY (`deliverableId`) REFERENCES `CampaignDeliverable` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable Notification
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` LONGTEXT NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `relatedId` VARCHAR(191),
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notification_userId_idx`(`userId`),
    CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable TrackingEvent
CREATE TABLE `TrackingEvent` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191),
    `event` VARCHAR(191) NOT NULL,
    `page` VARCHAR(191),
    `metadata` JSON,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `TrackingEvent_userId_idx`(`userId`),
    INDEX `TrackingEvent_event_idx`(`event`),
    CONSTRAINT `TrackingEvent_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable SupportTicket
CREATE TABLE `SupportTicket` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `assignedToId` VARCHAR(191),
    `subject` VARCHAR(191) NOT NULL,
    `category` ENUM('DISPUTE', 'PAYOUT', 'BILLING', 'CAMPAIGN', 'TECHNICAL', 'OTHER') NOT NULL,
    `priority` ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT') NOT NULL DEFAULT 'NORMAL',
    `status` ENUM('OPEN', 'IN_PROGRESS', 'AWAITING_USER', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SupportTicket_userId_idx`(`userId`),
    INDEX `SupportTicket_assignedToId_idx`(`assignedToId`),
    INDEX `SupportTicket_status_idx`(`status`),
    CONSTRAINT `SupportTicket_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `SupportTicket_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `User` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable SupportMessage
CREATE TABLE `SupportMessage` (
    `id` VARCHAR(191) NOT NULL,
    `ticketId` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `message` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SupportMessage_ticketId_idx`(`ticketId`),
    CONSTRAINT `SupportMessage_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `SupportTicket` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `SupportMessage_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
