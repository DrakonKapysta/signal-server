import { OnApplicationBootstrap, OnModuleInit } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomInfo } from 'src/common/interfaces/socket-data.interface';
import { SocketUser } from 'src/common/interfaces/socket-user.interface';
import { SocketDataHelper } from 'src/common/utils/socket-data.helper';
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
  @SubscribeMessage('calling')
  calling(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { targetSocketId: string; from: string },
  ): void {
    const calleeSocket = this.userSocketService.findUserBySocketId(
      data.targetSocketId,
    );
    const callerUserData = SocketDataHelper.getUserData(socket);
    if (calleeSocket) {
      const calleeUserData = SocketDataHelper.getUserData(calleeSocket);

      calleeSocket.emit('calling', {
        ...data,
        username: calleeUserData.username,
        callerUsername: callerUserData.username,
      });
    }
  }
  @SubscribeMessage('accepted')
  accepted(@MessageBody() data: { targetSocketId: string }): void {
    const socket = this.userSocketService.findUserBySocketId(
      data.targetSocketId,
    );
    if (socket) {
      socket.emit('accepted');
    }
  }
  @SubscribeMessage('declined')
  declined(@MessageBody() data: { targetSocketId: string }): void {
    const socket = this.userSocketService.findUserBySocketId(
      data.targetSocketId,
    );
    if (socket) {
      socket.emit('declined', data);
    }
  }
  @SubscribeMessage('create-room')
  async createRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomName: string },
  ): Promise<Partial<RoomInfo>> {
    if (this.userSocketService.roomExists(data.roomName)) {
      return { errorMessage: 'Room already exists' };
    }
    try {
      await socket.join(data.roomName);
      const userData = SocketDataHelper.getUserData(socket);

      const roomInfo = {
        ownerId: socket.id,
        ownerUsername: userData.username,
        roomName: data.roomName,
        errorMessage: null,
      };
      this.userSocketService.addRoom(data.roomName, roomInfo);
      return roomInfo;
    } catch (error) {
      console.error(error);
      return { errorMessage: 'Room already exists' };
    }
  }
  @SubscribeMessage('join-room')
  async joinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomName: string },
  ): Promise<Partial<RoomInfo>> {
    try {
      if (this.userSocketService.roomExists(data.roomName)) {
        const roomInfo = this.userSocketService.getRoomInfo(data.roomName);
        if (!roomInfo) {
          return { errorMessage: 'Room not found' };
        }
        await socket.join(data.roomName);
        this.server.to(data.roomName).emit('join-room', {
          message: `${SocketDataHelper.getUserData(socket).username} joined the room.`,
        });
        return roomInfo;
      }
      return { errorMessage: 'Room not found' };
    } catch (error: unknown) {
      console.error(error);
      return { errorMessage: (error as Error).message };
    }
  }
  @SubscribeMessage('leave-room')
  async leaveRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomName: string },
  ): Promise<void> {
    try {
      await socket.leave(data.roomName);
      this.server.to(data.roomName).emit('leave-room', {
        message: `${SocketDataHelper.getUserData(socket).username} left the room.`,
      });
    } catch (error) {
      console.error(error);
    }
  }
  // todo: make target parsing middleware.
  // todo: create a logger middleware.
}
