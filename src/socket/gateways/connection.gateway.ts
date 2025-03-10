import { OnApplicationBootstrap, OnModuleInit } from '@nestjs/common';
import { WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UserSocketService } from '../services/user-socket.service';
import { BaseGateway } from './base.gateway';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ConnectionGateway
  extends BaseGateway
  implements OnModuleInit, OnApplicationBootstrap
{
  constructor(userSocketService: UserSocketService) {
    super(userSocketService);
  }

  onModuleInit() {
    console.log('Module init');

    this.server.on('connection', (socket: Socket) => {
      console.log('a user connected', socket.id);

      this.userSocketService.addSocket(socket);

      socket.on('disconnect', () => {
        this.userSocketService.removeSocket(socket.id);
        console.log('a user disconnected', socket.id);
      });
    });
  }

  onApplicationBootstrap() {
    console.log('Application bootstrap');
  }
}
