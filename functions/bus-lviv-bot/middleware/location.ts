import axios from 'axios';
import { apiUrl } from '../config/config';
import { Stop } from '../types/stop';
import { Context } from 'telegraf';
import { Message } from '@telegraf/types/message';
import { logger } from '../index';

export const location = async (ctx: Context) => {
  const locationMessage = ctx.message as Message.LocationMessage;
  const lat = locationMessage.location.latitude;
  const lon = locationMessage.location.longitude;
  const closestStops = await fetchClosestStops(lat, lon);
  let message = 'Найближчі зупинки:\n';
  closestStops.forEach(stop => {
    message += `/${stop.code} - ${stop.name}\n`;
  });
  await ctx.reply(message);
};

const fetchClosestStops = async (latitude: number, longitude: number) => {
  logger.info(`latitude --> ${latitude}, longitude --> ${longitude}`);
  const response = await axios.get(`${apiUrl}/closest`, {
    params: {
      latitude,
      longitude,
    },
  });
  return response.data as Stop[];
};
