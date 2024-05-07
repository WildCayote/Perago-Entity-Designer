import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class PgBossGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;

  afterInit(server: any) {
    console.log('server initialized');
  }

  handleConnection(client: any, ...args: any[]) {
    console.log('client connected');
  }

  handleDisconnect(client: any) {
    console.log('client disconnected');
  }

  @SubscribeMessage('msgToServer')
  handleMessage(client: any, payload: any): string {
    console.log('message recieved: ', payload);
    return 'Message recieved: ' + payload;
  }
}
