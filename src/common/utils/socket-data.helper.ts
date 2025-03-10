import { Socket } from 'socket.io';
import { SocketUser } from 'src/common/interfaces/socket-user.interface';

export class SocketDataHelper {
  static getUserData(socket: Socket): SocketUser {
    if (!socket.data) {
      return { username: 'Anonymous', socketId: socket.id };
    }

    return socket.data as SocketUser;
  }

  static setUserData(socket: Socket, data: Partial<SocketUser>): void {
    const currentData = this.getUserData(socket);
    socket.data = { ...currentData, ...data };
  }
}
