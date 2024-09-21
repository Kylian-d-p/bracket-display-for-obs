/*
  Warnings:

  - Added the required column `phase` to the `matches` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `matches` ADD COLUMN `phase` INTEGER NOT NULL;
