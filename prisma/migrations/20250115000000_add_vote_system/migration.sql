-- AlterTable
ALTER TABLE `Build` ADD COLUMN `upvotes` INT NOT NULL DEFAULT 0,
                     ADD COLUMN `downvotes` INT NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `BuildVote` (
    `id` VARCHAR(191) NOT NULL,
    `buildId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `voteType` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `BuildVote_buildId_userId_key`(`buildId`, `userId`),
    INDEX `BuildVote_buildId_idx`(`buildId`),
    INDEX `BuildVote_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BuildVote` ADD CONSTRAINT `BuildVote_buildId_fkey` FOREIGN KEY (`buildId`) REFERENCES `Build`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BuildVote` ADD CONSTRAINT `BuildVote_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

