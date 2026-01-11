import axios from 'axios';
import { apiUrl } from '../config/config';
import { Stop } from '../types/stop';
import { Context } from 'telegraf';
import { Message } from '@telegraf/types/message';

export const location = async (ctx: Context) => {
  const locationMessage = ctx.message as Message.LocationMessage;
  const lat = locationMessage.location.latitude;
  const lon = locationMessage.location.longitude;
  try {
    const closestStops = await fetchClosestStops(lat, lon);
    let message = 'Найближчі зупинки:\n';
    closestStops.forEach(stop => {
      message += `/${stop.code} - ${stop.name}\n`;
    });
    await ctx.reply(message);
  } catch (error) {
    console.error('Error fetching closest stops:', error);
    await ctx.reply('Вибачте, сталася помилка при пошуку найближчих зупинок. Спробуйте пізніше.');
  }
};

const fetchClosestStops = async (latitude: number, longitude: number) => {
  const response = await axios.get(`${apiUrl}/closest`, {
    params: {
      latitude,
      longitude,
    },
    timeout: 5000,
  });
  return response.data as Stop[];
};
