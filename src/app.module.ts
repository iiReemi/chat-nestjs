import { Module } from '@nestjs/common';
import { ChatGateway } from './events.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [ChatGateway],
})
export class AppModule {}
