-- CreateTable
CREATE TABLE `Build` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `author` VARCHAR(191) NOT NULL,
    `authorTwitchUrl` VARCHAR(191) NOT NULL,
    `authorYoutubeUrl` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Build_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
