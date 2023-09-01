import { Ctx, Message, On, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';

import { BotService } from './bot.service';

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @On('text')
  async hears(@Message('text') text: string, @Ctx() ctx: Context) {
    const telegramId = ctx.message.from.id;
    const result = await this.botService.processMsg(text, telegramId);
    const keyboard = this.botService.prepareKeyboard(result.buttons);

    if (result.photo) {
      ctx.replyWithPhoto(result.photo, {
        caption: result.text,
        reply_markup: keyboard,
        parse_mode: 'HTML',
      });
    } else {
      ctx.reply(result.text, {
        reply_markup: keyboard,
        parse_mode: 'HTML',
      });
    }
  }
}
