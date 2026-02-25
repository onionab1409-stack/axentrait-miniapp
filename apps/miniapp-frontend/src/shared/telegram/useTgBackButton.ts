import { useEffect } from 'react';
import { getTg } from './tg';

export function useTgBackButton(isVisible: boolean, onBack: () => void) {
  useEffect(() => {
    const tg = getTg();
    if (!tg?.BackButton) return;
    if (isVisible) tg.BackButton.show();
    else tg.BackButton.hide();
    tg.BackButton.onClick(onBack);
    return () => tg.BackButton?.offClick(onBack);
  }, [isVisible, onBack]);
}
