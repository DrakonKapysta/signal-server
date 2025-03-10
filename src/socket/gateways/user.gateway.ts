import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
} from '@nestjs/websockets';
import { SocketUser } from 'src/common/interfaces/socket-user.interface';
import { UserSocketService } from '../services/user-socket.service';
import { BaseGateway } from './base.gateway';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class UserGateway extends BaseGateway {
  constructor(userSocketService: UserSocketService) {
    super(userSocketService);
  }

  @SubscribeMessage('setUserName')
  setUserName(
    @MessageBody() data: { username: string; socketId: string },
  ): void {
    this.userSocketService.setUsername(data.socketId, data.username);
  }

  @SubscribeMessage('getAllUser')
  getAllUsers(): SocketUser[] {
    return this.userSocketService.getAllUsers();
  }
}
