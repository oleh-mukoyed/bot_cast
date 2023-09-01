import { Module } from '@nestjs/common';
import { BotService } from 'src/bot/bot.service';
import { UserModule } from 'src/user/user.module';

import { CommandsGateway } from './commands.gateway';

@Module({
  imports: [UserModule],
  providers: [CommandsGateway, BotService],
  exports: [CommandsGateway],
})
export class CommandsModule {}
