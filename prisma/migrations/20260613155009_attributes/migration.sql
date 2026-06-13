/*
  Warnings:

  - You are about to drop the column `size` on the `Product` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Facture` DROP FOREIGN KEY `Facture_order_id_fkey`;

-- DropIndex
DROP INDEX `Facture_order_id_key` ON `Facture`;

-- AlterTable
ALTER TABLE `Facture` ADD COLUMN `type` ENUM('INVOICE', 'REFUND') NOT NULL DEFAULT 'INVOICE';

-- AlterTable
ALTER TABLE `Product` DROP COLUMN `size`;

-- CreateTable
CREATE TABLE `Attribute` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Attribute_type_value_key`(`type`, `value`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product_Attribute` (
    `product_id` VARCHAR(191) NOT NULL,
    `attribute_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`product_id`, `attribute_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;



-- AddForeignKey
ALTER TABLE `Product_Attribute` ADD CONSTRAINT `Product_Attribute_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product_Attribute` ADD CONSTRAINT `Product_Attribute_attribute_id_fkey` FOREIGN KEY (`attribute_id`) REFERENCES `Attribute`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
