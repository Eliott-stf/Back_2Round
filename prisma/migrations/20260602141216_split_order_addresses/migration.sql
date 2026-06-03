/*
  Warnings:

  - The values [EXPIRED] on the enum `Offer_status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `address_id` on the `Order` table. All the data in the column will be lost.
  - Added the required column `billing_address_id` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipping_address_id` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Order` DROP FOREIGN KEY `Order_address_id_fkey`;

-- DropIndex
DROP INDEX `Order_address_id_fkey` ON `Order`;

-- AlterTable
ALTER TABLE `Offer` MODIFY `status` ENUM('PENDING', 'ACCEPTED', 'DECLINED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `Order` DROP COLUMN `address_id`,
    ADD COLUMN `addressId` VARCHAR(191) NULL,
    ADD COLUMN `billing_address_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `shipping_address_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_shipping_address_id_fkey` FOREIGN KEY (`shipping_address_id`) REFERENCES `Address`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_billing_address_id_fkey` FOREIGN KEY (`billing_address_id`) REFERENCES `Address`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_addressId_fkey` FOREIGN KEY (`addressId`) REFERENCES `Address`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
