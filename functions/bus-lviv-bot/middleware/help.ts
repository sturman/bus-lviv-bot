import image from '../img/plate.jpeg';
import { Context } from 'telegraf';

const helpText = `Для отримання інформації, потрібно відправити номер зупинки і я постараюсь знайти інформацію по громадському транспорту для цієї зупинки.

Також я вмію шукати найближчі зупинки. Для цього просто відправ мені свою локацію через \u{1F4CE} або через кнопку після виконання команди /start`;

export const help = (ctx: Context) => {
  return ctx.replyWithPhoto(
    { source: image },
    {
      caption: helpText,
      parse_mode: 'Markdown',
    },
  );
};
