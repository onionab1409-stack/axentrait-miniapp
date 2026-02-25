import { getTg } from '../telegram/tg';

type TgThemeParams = {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
};

function normalizeHex(input?: string): string | null {
  if (!input) return null;
  const s = input.trim();
  if (s.startsWith('#') && /^#[0-9a-fA-F]{6}$/.test(s)) return s;
  if (/^[0-9a-fA-F]{6}$/.test(s)) return `#${s}`;
  return null;
}

function fallbackThemeScheme() {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTelegramThemeVars() {
  const tg = getTg();
  const root = document.documentElement;

  const scheme = tg?.colorScheme === 'dark' || tg?.colorScheme === 'light' ? tg.colorScheme : fallbackThemeScheme();
  root.dataset.theme = scheme;

  const p = (tg?.themeParams ?? {}) as TgThemeParams;
  const vars: Record<string, string | null> = {
    '--tg-bg': normalizeHex(p.bg_color),
    '--tg-text': normalizeHex(p.text_color),
    '--tg-hint': normalizeHex(p.hint_color),
    '--tg-link': normalizeHex(p.link_color),
    '--tg-button': normalizeHex(p.button_color),
    '--tg-button-text': normalizeHex(p.button_text_color),
    '--tg-secondary-bg': normalizeHex(p.secondary_bg_color),
  };

  for (const [k, v] of Object.entries(vars)) {
    if (v) root.style.setProperty(k, v);
    else root.style.removeProperty(k);
  }
}

export function initTelegramThemeBridge() {
  const tg = getTg();
  applyTelegramThemeVars();

  const onThemeChanged = () => applyTelegramThemeVars();
  const onViewportChanged = () => {
    const height = tg?.viewportHeight;
    if (height && Number.isFinite(height)) {
      document.documentElement.style.setProperty('--tg-viewport-height', `${Math.max(0, height)}px`);
    }
  };

  if (!tg?.onEvent) return;

  tg.onEvent('themeChanged', onThemeChanged);
  tg.onEvent('viewportChanged', onViewportChanged);
  onViewportChanged();
}
