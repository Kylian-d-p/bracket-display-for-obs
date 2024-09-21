-- DropForeignKey
ALTER TABLE `matches` DROP FOREIGN KEY `matches_team1_id_fkey`;

-- DropForeignKey
ALTER TABLE `matches` DROP FOREIGN KEY `matches_team2_id_fkey`;

-- AlterTable
ALTER TABLE `matches` MODIFY `team1_id` VARCHAR(191) NULL,
    MODIFY `team2_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `matches` ADD CONSTRAINT `matches_team1_id_fkey` FOREIGN KEY (`team1_id`) REFERENCES `teams`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matches` ADD CONSTRAINT `matches_team2_id_fkey` FOREIGN KEY (`team2_id`) REFERENCES `teams`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
