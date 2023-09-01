import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { CommandsModule } from 'src/commands/commands.module';
import { UserModule } from 'src/user/user.module';

import { BotService } from './bot.service';
import { BotUpdate } from './bot.update';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        token: configService.get<string>('TELEGRAM_TOKEN'),
      }),
      inject: [ConfigService],
    }),
    CommandsModule,
    UserModule,
  ],
  providers: [BotService, BotUpdate],
})
export class BotModule {}
