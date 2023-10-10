import { Injectable } from '@nestjs/common';
import { EVENTS } from '@bot_cast/shared';
import { CommandsGateway } from 'src/commands/commands.gateway';
import { CommandResult } from 'src/interfaces/command.result';
import { SocketClient } from 'src/interfaces/socket.client';
import { UserService } from 'src/user/user.service';
import {
  ReplyKeyboardMarkup,
  ReplyKeyboardRemove,
} from 'telegraf/typings/core/types/typegram';

@Injectable()
export class BotService {
  constructor(
    private readonly commandsGateway: CommandsGateway,
    private readonly userService: UserService,
  ) {}

  async processMsg(text: string, telegramId: number): Promise<CommandResult> {
    try {
      const client = this.getClient(telegramId, text);

      if (!client) {
        const dbUser = await this.userService.userUnique({
          telegramId: telegramId,
        });
        const msg = dbUser
          ? 'Please, start BotCast app.'
          : 'Please, enter valid auth code.';
        throw new Error(msg);
      }

      const socket = this.commandsGateway.server.sockets.sockets.get(
        client.socketId,
      );

      if (client.telegramId) {
        return await this.emitWithResult(socket, EVENTS.COMMAND, text);
      }

      const updateUser = await this.userService.setTelegramIdByClientId(
        telegramId,
        text,
      );

      if (!updateUser) {
        throw new Error('Unknown error, please contact administrator.');
      }

      client.telegramId = telegramId;
      this.commandsGateway.clients.set(client.socketId, client);

      return await this.emitWithResult(socket, EVENTS.TELEGRAM_ID, telegramId);
    } catch (error) {
      return { buttons: [], text: error.message };
    }
  }

  emitWithResult(
    socket: any,
    command: string,
    data: unknown,
  ): Promise<CommandResult> {
    return new Promise((resolve) =>
      socket.emit(command, data, (response) => resolve(response)),
    );
  }

  getClient(telegramId: number, clientId: string): SocketClient {
    return [...this.commandsGateway.clients.values()].find(
      (c) => c.telegramId === telegramId || c.clientId === clientId,
    );
  }

  prepareKeyboard(
    buttons: Array<string>,
  ): ReplyKeyboardRemove | ReplyKeyboardMarkup {
    if (buttons.length === 0)
      return { remove_keyboard: true } as ReplyKeyboardRemove;

    const keyboard = buttons.map((button, _) => {
      return {
        text: button,
      };
    });

    const rows = [];
    for (let i = 0; i < keyboard.length; i += 3) {
      rows.push(keyboard.slice(i, i + 3));
    }

    return {
      keyboard: rows,
      resize_keyboard: true,
    } as ReplyKeyboardMarkup;
  }
}
