-- AlterTable
ALTER TABLE `Build` ADD COLUMN `isPublic` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `Build_isPublic_idx` ON `Build`(`isPublic`);






