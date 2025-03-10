export interface SocketData {
  username: string;
}

export interface RoomInfo {
  roomName: string;
  ownerId: string;
  ownerUsername: string;
  errorMessage: string | null;
}
