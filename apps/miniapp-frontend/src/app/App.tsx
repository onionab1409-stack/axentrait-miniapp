import { Suspense, useEffect, useMemo, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { tgExpand, tgReady } from '../shared/telegram/tg';
import { initTelegramThemeBridge } from '../shared/theme/telegramTheme';
import { OfflineBanner } from '../components/ui/OfflineBanner';
import { initAuth } from '../shared/api/authInit';
import { trackEvent } from '../shared/analytics/track';

export function App() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [authBootstrapped, setAuthBootstrapped] = useState(false);

  const stableRouter = useMemo(() => router, []);

  useEffect(() => {
    tgReady();
    tgExpand();
    initTelegramThemeBridge();
    trackEvent('app_opened', { screen_id: 'app_root' });

    let mounted = true;
    void initAuth().finally(() => {
      if (mounted) setAuthBootstrapped(true);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return (
    <>
      {!isOnline ? <OfflineBanner /> : null}
      {!authBootstrapped ? (
        <div className="ax-route-loader">Инициализация…</div>
      ) : (
        <Suspense fallback={<div className="ax-route-loader">Загрузка…</div>}>
          <RouterProvider router={stableRouter} />
        </Suspense>
      )}
    </>
  );
}
