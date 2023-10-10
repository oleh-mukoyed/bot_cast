import { Inject, Logger, forwardRef } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { EVENTS } from '@bot_cast/shared';
import { InjectBot } from 'nestjs-telegraf';
import { Server } from 'socket.io';
import { BotService } from 'src/bot/bot.service';
import { SocketClient } from 'src/interfaces/socket.client';
import { UserService } from 'src/user/user.service';
import { Telegraf } from 'telegraf';

@WebSocketGateway({
  cors: {
    origin: ['*'],
  },
})
export class CommandsGateway {
  private readonly logger = new Logger(CommandsGateway.name);

  constructor(
    private readonly userService: UserService,
    @InjectBot() private bot: Telegraf,
    @Inject(forwardRef(() => BotService))
    private readonly botService: BotService,
  ) {}
  @WebSocketServer()
  server: Server;

  clients = new Map<string, SocketClient>();

  onModuleInit() {
    this.server.on(EVENTS.SERVER_ON_CONNECTION, async (socket) => {
      const clientData = (await this.processUserConnection(
        socket,
      )) as SocketClient;

      //this.logger.log('clientData: ', clientData);

      if (!clientData) {
        this.logger.error('Client not found');
        return;
      }

      socket.on(EVENTS.STAGE, (data) => {
        if (!clientData.telegramId) {
          this.logger.error(`on ${EVENTS.STAGE}: telegramId not specified`);
          return;
        }

        this.bot.telegram.sendMessage(clientData.telegramId, data.text, {
          reply_markup: this.botService.prepareKeyboard(data.buttons),
          parse_mode: 'HTML',
        });
      });

      socket.on(EVENTS.SOCKET_ON_DISCONNECT, () => {
        this.clients.delete(socket.id);

        if (!clientData.telegramId) {
          this.logger.error(
            `on ${EVENTS.SOCKET_ON_DISCONNECT}: telegramId not specified`,
          );
          return;
        }

        this.bot.telegram.sendMessage(
          clientData.telegramId,
          'App disconnected.',
          {
            reply_markup: this.botService.prepareKeyboard([]),
            parse_mode: 'HTML',
          },
        );
      });
    });
  }

  async processUserConnection(socket: any): Promise<SocketClient | boolean> {
    const clientId = socket.handshake.auth.client_id;

    if (!clientId) return false;

    const clientData: SocketClient = {
      socketId: socket.id,
      clientId: clientId,
      authStatus: false,
    };

    const user = await this.userService.findOrCreateUserByClientId(clientId);
    const telegramId = user.telegramId || socket.handshake.auth.telegram_id;

    if (!user.telegramId && telegramId) {
      await this.userService.setTelegramIdByClientId(telegramId, clientId);
    }

    if (telegramId) {
      clientData.authStatus = true;
      clientData.telegramId = telegramId;

      const text = socket.handshake?.auth?.text ?? 'App connected.';
      const buttons = socket.handshake?.auth?.buttons ?? [];
      this.bot.telegram.sendMessage(telegramId, text, {
        reply_markup: this.botService.prepareKeyboard(buttons),
        parse_mode: 'HTML',
      });
    }

    this.clients.set(socket.id, clientData);

    return clientData;
  }
}
