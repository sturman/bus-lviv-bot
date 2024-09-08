import { Context, Markup } from 'telegraf';
import image from '../img/plate.jpeg';

const startText =
  'Вітаю! Я допоможу Вам знайти розклад громадського транспорту Львова, якщо ви відправите мені номер зупинки (виділено червоним на фото), наприклад 216, або свою локацію і я знайду найближчі зупинки';

export const start = async (ctx: Context) => {
  const keyboard = Markup.keyboard([Markup.button.locationRequest('\u{1F4CC} Відправити локацію')])
    .oneTime()
    .resize();
  await ctx.replyWithPhoto(
    { source: image },
    {
      caption: startText,
      parse_mode: 'Markdown',
      ...keyboard,
    },
  );
};
