import { Module } from '@nestjs/common';
import { UserSocketService } from './services/user-socket.service';
import { ConnectionGateway } from './gateways/connection.gateway';
import { UserGateway } from './gateways/user.gateway';
import { RoomGateway } from './gateways/room.gateway';
import { CallGateway } from './gateways/call.gateway';

@Module({
  providers: [
    UserSocketService,
    ConnectionGateway,
    UserGateway,
    RoomGateway,
    CallGateway,
  ],
  exports: [UserSocketService],
})
export class SocketModule {}
