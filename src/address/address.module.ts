import { Module } from '@nestjs/common';
import { AddressesController } from './address.controller';
import { AddressService } from './address.service';


@Module({
  controllers: [AddressesController],
  providers: [AddressService],
})
export class AddressModule {}
