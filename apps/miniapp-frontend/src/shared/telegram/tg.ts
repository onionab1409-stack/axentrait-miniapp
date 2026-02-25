export type TgThemeParams = {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
};

export type TgWebApp = {
  ready?: () => void;
  expand?: () => void;
  initData?: string;
  initDataUnsafe?: Record<string, unknown>;
  colorScheme?: 'light' | 'dark';
  themeParams?: TgThemeParams;
  onEvent?: (event: string, handler: () => void) => void;
  offEvent?: (event: string, handler: () => void) => void;
  openLink?: (url: string) => void;
  openTelegramLink?: (url: string) => void;
  viewportHeight?: number;
  BackButton?: {
    show: () => void;
    hide: () => void;
    onClick: (fn: () => void) => void;
    offClick: (fn: () => void) => void;
  };
  MainButton?: {
    setParams: (params: { text?: string; is_visible?: boolean; is_active?: boolean; color?: string; text_color?: string }) => void;
    onClick: (fn: () => void) => void;
    offClick: (fn: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  HapticFeedback?: {
    impactOccurred?: (style: 'light' | 'medium' | 'heavy') => void;
  };
  CloudStorage?: {
    getItem: (key: string, cb: (err: unknown, value?: string) => void) => void;
    setItem: (key: string, value: string, cb: (err: unknown, ok?: boolean) => void) => void;
  };
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TgWebApp;
    };
  }
}

export function getTg(): TgWebApp | null {
  return (window as Window).Telegram?.WebApp ?? null;
}

export function tgReady() {
  const tg = getTg();
  tg?.ready?.();
}

export function tgExpand() {
  const tg = getTg();
  tg?.expand?.();
}

export function tgInitData(): string {
  const tg = getTg();
  return tg?.initData ?? '';
}

export function tgInitDataUnsafe(): Record<string, unknown> {
  const tg = getTg();
  return tg?.initDataUnsafe ?? {};
}

export function tgHapticLight() {
  const tg = getTg();
  tg?.HapticFeedback?.impactOccurred?.('light');
}
