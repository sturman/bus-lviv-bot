import axios from 'axios';
import { Stop } from '../types/stop';
import { apiUrl } from '../config/config';
import { Context } from 'telegraf';
import { Message } from '@telegraf/types/message';
import { buildStopMessage } from '../format/stop-message';

export const lad = async (ctx: Context) => {
  const message = ctx.message as Message.TextMessage;
  const stopId: number = parseInt(message.text.replace('/', ''));
  if (isNaN(stopId) || stopId <= 0) {
    await ctx.reply('Будь ласка, введіть коректний номер зупинки (позитивне число).');
    return;
  }
  try {
    const stop: Stop = await fetchStop(stopId);
    await ctx.reply(buildStopMessage(stop), {
      reply_parameters: { message_id: message.message_id },
    });
  } catch (error) {
    console.error('Error fetching stop:', error);
    await ctx.reply('Вибачте, сталася помилка при отриманні інформації про зупинку. Спробуйте пізніше.');
  }
};

const fetchStop = async (stopId: number) => {
  const response = await axios.get(`${apiUrl}/stops/${stopId}`, {
    timeout: 5000,
  });
  return response.data as Stop;
};
