export interface SocketClient {
  socketId: string;
  clientId: string;
  authStatus: boolean;
  telegramId?: number;
}
