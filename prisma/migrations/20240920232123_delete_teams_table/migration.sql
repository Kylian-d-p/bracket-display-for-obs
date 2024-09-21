/*
  Warnings:

  - You are about to drop the column `team1_id` on the `matches` table. All the data in the column will be lost.
  - You are about to drop the column `team2_id` on the `matches` table. All the data in the column will be lost.
  - You are about to drop the `teams` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `matches` DROP FOREIGN KEY `matches_team1_id_fkey`;

-- DropForeignKey
ALTER TABLE `matches` DROP FOREIGN KEY `matches_team2_id_fkey`;

-- AlterTable
ALTER TABLE `matches` DROP COLUMN `team1_id`,
    DROP COLUMN `team2_id`,
    ADD COLUMN `team1` VARCHAR(191) NULL,
    ADD COLUMN `team2` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `teams`;
