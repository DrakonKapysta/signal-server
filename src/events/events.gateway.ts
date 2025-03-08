import { OnApplicationBootstrap, OnModuleInit } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketUser } from 'src/common/interfaces/socket-user.interface';
import { UserSocketService } from 'src/socket/user-socket.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnModuleInit, OnApplicationBootstrap {
  @WebSocketServer()
  server: Server;
  constructor(private readonly userSocketService: UserSocketService) {}
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
  @SubscribeMessage('newRTCCreateOffer')
  createOffer(@MessageBody() data: { targetSocketId: string }): void {
    const socket = this.userSocketService.findUserBySocketId(
      data.targetSocketId,
    );
    if (socket) {
      socket.emit('offer', data);
    }
  }
  @SubscribeMessage('newRTCCreateAnswer')
  createAnswer(@MessageBody() data: { targetSocketId: string }): void {
    const socket = this.userSocketService.findUserBySocketId(
      data.targetSocketId,
    );
    if (socket) {
      socket.emit('answer', data);
    }
  }
  @SubscribeMessage('newICECandidate')
  createCandidate(@MessageBody() data: { targetSocketId: string }): void {
    const socket = this.userSocketService.findUserBySocketId(
      data.targetSocketId,
    );
    console.log(data);
    if (socket) {
      socket.emit('ice-candidate', data);
    }
  }
  @SubscribeMessage('hang-up')
  hangUp(@MessageBody() data: { targetSocketId: string }): void {
    const socket = this.userSocketService.findUserBySocketId(
      data.targetSocketId,
    );
    if (socket) {
      socket.emit('hang-up', data);
    }
  }
}
