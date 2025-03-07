import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { SocketData } from 'src/common/interfaces/socket-data.interface';
import { SocketUser } from '../common/interfaces/socket-user.interface';

@Injectable()
export class UserSocketService {
  private connnectedSockets: Map<string, Socket>;

  constructor() {
    this.connnectedSockets = new Map<string, Socket>();
  }
  addSocket(socket: Socket): void {
    this.connnectedSockets.set(socket.id, socket);
  }

  removeSocket(socketId: string): void {
    this.connnectedSockets.delete(socketId);
  }

  findUserBySocketId(socketId: string): Socket | undefined {
    return this.connnectedSockets.get(socketId);
  }

  getAllUsers(): SocketUser[] {
    return Array.from(this.connnectedSockets.values()).map((socket) => ({
      username: (socket.data as SocketData).username || 'Anonymous',
      socketId: socket.id,
    }));
  }

  setUsername(socketId: string, username: string): void {
    const socket = this.findUserBySocketId(socketId);
    if (socket) {
      (socket.data as SocketData).username = username;
    }
  }
}
