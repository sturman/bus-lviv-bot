import { Logger } from '@aws-lambda-powertools/logger';
import { Context, Telegraf } from 'telegraf';
import { start } from './middleware/start';
import { help } from './middleware/help';
import { location } from './middleware/location';
import { message } from 'telegraf/filters';
import { lad } from './middleware/lad';
import { token } from './config/config';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Update } from '@telegraf/types/update';

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

export const handler = async (event: APIGatewayProxyEventV2) => {
  try {
    const body = JSON.parse(event.body!) as Update;
    logger.info('body -->', { body });
    await bot.handleUpdate(body);
  } catch (error: unknown) {
    logger.error('error -->', { error });
  }
  // respond to Telegram that the webhook has been received.
  // if this is not sent, telegram will try to resend the webhook over and over again.
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'function executed successfully' }),
  };
};
