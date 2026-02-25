import { useEffect } from 'react';

type MainButtonConfig = {
  text?: string;
  visible?: boolean;
  enabled?: boolean;
  onClick?: () => void;
};

/**
 * DEPRECATED: Telegram MainButton отключен.
 * Используем in-page кнопки для единого premium-дизайна.
 */
export function useTgMainButton(_config?: MainButtonConfig) {
  useEffect(() => {
    try {
      window.Telegram?.WebApp?.MainButton?.hide();
    } catch {
      // no-op
    }
  }, []);
}

export default useTgMainButton;
