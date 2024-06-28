import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

type Message = {
  message: string;
  sender: string;
  date: string;
  room: string;
};

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3001', // Substitua pelo seu front-end URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['my-custom-header'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);

    client.on('join', (room: string) => {
      // console.log(`Client join in room ${room}`);
      client.join(room);
    });

    client.on('leave-rooms', () => {
      const rooms = Array.from(client.rooms);
      rooms.forEach((room) => {
        if (room !== client.id) {
          client.leave(room);
        }
      });
      // console.log(`Client ${client.id} left all rooms`);
    });
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() message: Message): void {
    this.server.to(message.room).emit('message', message);
  }
}
