import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

type Message = {
  id: string;
  message: string;
  sender: string;
  date: string;
  room: string;
  type: 'text' | 'audio' | 'media';
};

type UserAction = {
  room: string;
  name: string;
  type: 'text' | 'audio';
};

type NewParticipant = {
  room: string;
  name: string;
};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);

    client.on('join', (room: string) => {
      client.join(room);
    });

    client.on('leave-rooms', () => {
      const rooms = Array.from(client.rooms);
      rooms.forEach((room) => {
        if (room !== client.id) {
          client.leave(room);
        }
      });
    });
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() message: Message,
    @ConnectedSocket() client: Socket,
  ): void {
    client.broadcast.to(message.room).emit('message', message);
  }

  @SubscribeMessage('user-action')
  handleTyping(
    @MessageBody() action: UserAction,
    @ConnectedSocket() client: Socket,
  ): void {
    client.broadcast.to(action.room).emit('user-action', action);
  }

  @SubscribeMessage('new-participant')
  handleNewParticipant(
    @MessageBody() data: NewParticipant,
    @ConnectedSocket() client: Socket,
  ): void {
    client.broadcast.to(data.room).emit('new-participant', data.name);
  }
}
