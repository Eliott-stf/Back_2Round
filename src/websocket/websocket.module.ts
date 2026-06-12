import { Global, Module } from '@nestjs/common';
import { MessagesGateway } from './messages.gateway';

@Global()
@Module({
  providers: [MessagesGateway],
  exports: [MessagesGateway],
})
export class WebsocketModule {}
