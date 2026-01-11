import axios from 'axios';
import { Stop } from '../types/stop';
import { bold, code, fmt } from 'telegraf/format';
import { apiUrl } from '../config/config';
import { Context } from 'telegraf';
import { Message } from '@telegraf/types/message';

export const lad = async (ctx: Context) => {
  const message = ctx.message as Message.TextMessage;
  const stopId: number = parseInt(message.text.replace('/', ''));
  if (isNaN(stopId) || stopId <= 0) {
    await ctx.reply('Будь ласка, введіть коректний номер зупинки (позитивне число).');
    return;
  }
  try {
    const stop: Stop = await fetchStop(stopId);
    const markdown = getMessageMarkdown(stop);
    await ctx.reply(markdown, {
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

const getMessageMarkdown = (stop: Stop) => {
  const timetable = stop.timetable;
  let routes = '';
  timetable?.forEach(route => {
    routes += `${convertVehicleTypeToEmoji(route.vehicle_type)} ${route.route} - ${route.time_left} - \u{1F68F} ${route.end_stop}\n`;
  });
  return fmt`
${bold(stop.code)}
${code(stop.name)}
------------------------------
${routes}
/${stop.code}
`;
};

const convertVehicleTypeToEmoji = (vehicleType: string) => {
  switch (vehicleType) {
    case 'bus':
    case 'marshrutka':
      return '\u{1F68C}';
    case 'tram':
      return '\u{1F68B}';
    case 'trol':
      return '\u{1F68E}';
    default:
      return '';
  }
};
