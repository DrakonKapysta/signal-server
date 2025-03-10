import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { RoomInfo } from 'src/common/interfaces/socket-data.interface';
import { SocketDataHelper } from 'src/common/utils/socket-data.helper';
import { UserSocketService } from '../services/user-socket.service';
import { BaseGateway } from './base.gateway';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RoomGateway extends BaseGateway {
  constructor(userSocketService: UserSocketService) {
    super(userSocketService);
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
}
