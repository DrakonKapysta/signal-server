import { Module } from '@nestjs/common';
import { EventsModule } from './events/events.module';
import { UserSocketService } from './socket/user-socket.service';

@Module({
  imports: [EventsModule],
  providers: [UserSocketService],
})
export class AppModule {}
