import axios from 'axios';
import { Stop } from '../types/stop';
import { apiUrl } from '../config/config';
import { Context } from 'telegraf';
import { Message } from '@telegraf/types/message';
import { buildStopMessage } from '../format/stop-message';
import { isNotFoundError } from '../api/errors';
import { logger } from '../logger';

const INVALID_STOP_ID = 'Будь ласка, введіть коректний номер зупинки (позитивне число).';
const FETCH_FAILED = 'Вибачте, сталася помилка при отриманні інформації про зупинку. Спробуйте пізніше.';

const stopNotFound = (stopId: number) =>
  `Зупинки з номером ${stopId} не знайдено. Перевірте номер на табличці або надішліть свою локацію, щоб знайти найближчі зупинки.`;

export const lad = async (ctx: Context) => {
  const message = ctx.message as Message.TextMessage;
  const stopId: number = parseInt(message.text.replace('/', ''));
  if (isNaN(stopId) || stopId <= 0) {
    await ctx.reply(INVALID_STOP_ID);
    return;
  }
  try {
    const stop: Stop = await fetchStop(stopId);
    await ctx.reply(buildStopMessage(stop), {
      reply_parameters: { message_id: message.message_id },
    });
  } catch (error) {
    // A wrong stop number is a normal user mistake, not a failure worth alerting on.
    if (isNotFoundError(error)) {
      logger.info('Stop not found', { stopId });
      await ctx.reply(stopNotFound(stopId));
      return;
    }
    logger.error('Error fetching stop', { stopId, error });
    await ctx.reply(FETCH_FAILED);
  }
};

const fetchStop = async (stopId: number) => {
  const response = await axios.get(`${apiUrl}/stops/${stopId}`, {
    timeout: 5000,
  });
  return response.data as Stop;
};
