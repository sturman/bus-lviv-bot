import { Logger } from '@aws-lambda-powertools/logger';
import { Context, Telegraf } from 'telegraf';
import { start } from './middleware/start';
import { help } from './middleware/help';
import { location } from './middleware/location';
import { message } from 'telegraf/filters';
import { lad } from './middleware/lad';
import { token } from './config/config';

export const logger = new Logger({ serviceName: 'bus-lviv-bot' });

const bot = new Telegraf(token);

bot.start(start);
bot.help(help);
bot.on(message('location'), location);
bot.hears(/(^\d+$)|(^\/\d+$)/, lad);

bot.catch((err, ctx: Context) => {
  logger.error(`Ooops, encountered an error for ${ctx.updateType}, ${ctx.message}`, { err });
});

// bot.on(message('text'), ctx => ctx.reply(`Hello, ${ctx.message.from.first_name}.\nYou've just sent ${ctx.message.text}`));

export const handler = async (event: any) => {
  const body = JSON.parse(event.body);
  logger.info(body);
  await bot.handleUpdate(body);
  return {
    statusCode: 200,
    body: '',
  };
};
