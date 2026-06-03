/*
  Warnings:

  - You are about to drop the column `addressId` on the `Order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Order` DROP FOREIGN KEY `Order_addressId_fkey`;

-- DropIndex
DROP INDEX `Order_addressId_fkey` ON `Order`;

-- AlterTable
ALTER TABLE `Order` DROP COLUMN `addressId`;
