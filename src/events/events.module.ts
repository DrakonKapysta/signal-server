import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  imports: [SocketModule],
  providers: [EventsGateway],
})
export class EventsModule {}
