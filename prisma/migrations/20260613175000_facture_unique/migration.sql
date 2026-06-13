-- CreateIndex
CREATE UNIQUE INDEX `Facture_order_id_type_key` ON `Facture`(`order_id`, `type`);

-- AddForeignKey
ALTER TABLE `Facture` ADD CONSTRAINT `Facture_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

