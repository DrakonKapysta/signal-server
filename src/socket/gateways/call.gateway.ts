import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { SocketDataHelper } from 'src/common/utils/socket-data.helper';
import { UserSocketService } from '../services/user-socket.service';
import { BaseGateway } from './base.gateway';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class CallGateway extends BaseGateway {
  constructor(userSocketService: UserSocketService) {
    super(userSocketService);
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
}
