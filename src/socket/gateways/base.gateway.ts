import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UserSocketService } from '../services/user-socket.service';

export abstract class BaseGateway {
  @WebSocketServer()
  protected server: Server;

  constructor(protected readonly userSocketService: UserSocketService) {}
}
