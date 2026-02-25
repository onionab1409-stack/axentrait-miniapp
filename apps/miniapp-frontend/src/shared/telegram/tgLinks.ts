import { getTg } from './tg';

/** Внешние ссылки — открывать через Telegram API (SSOT 3.1.5) */
export function tgOpenLink(url: string) {
  const tg = getTg();
  if (tg?.openLink) tg.openLink(url);
  else window.open(url, '_blank');
}

/** Ссылки внутри Telegram (t.me/...) */
export function tgOpenTelegramLink(url: string) {
  const tg = getTg();
  if (tg?.openTelegramLink) tg.openTelegramLink(url);
  else window.open(url, '_blank');
}
