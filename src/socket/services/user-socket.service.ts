import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import {
  RoomInfo,
  SocketData,
} from 'src/common/interfaces/socket-data.interface';
import { SocketUser } from 'src/common/interfaces/socket-user.interface';

@Injectable()
export class UserSocketService {
  private connnectedSockets: Map<string, Socket>;
  private rooms: Map<string, RoomInfo>;

  constructor() {
    this.connnectedSockets = new Map<string, Socket>();
    this.rooms = new Map<string, RoomInfo>();
  }
  addRoom(roomName: string, roomInfo: RoomInfo): void {
    this.rooms.set(roomName, roomInfo);
  }
  roomExists(roomName: string): boolean {
    return this.rooms.has(roomName);
  }
  getRoomInfo(roomName: string): RoomInfo | undefined {
    return this.rooms.get(roomName);
  }
  removeRoom(roomName: string): void {
    this.rooms.delete(roomName);
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
