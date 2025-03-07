import { Module } from '@nestjs/common';
import { UserSocketService } from './user-socket.service';

@Module({
  providers: [UserSocketService],
  exports: [UserSocketService],
})
export class SocketModule {}
