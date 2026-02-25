import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { MjImage } from '../../components/ui/MjImage';
import { track } from '../../shared/analytics/track';
import { SplashRive } from './SplashRive';

export default function SplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    track('app_opened', { screen_id: 'SCR-ONB-001' });
    const timer = setTimeout(() => navigate('/welcome'), 2200);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <main className="ax-shell" style={{ justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
      <MjImage
        id="splash-bg"
        scrim={false}
        borderRadius={0}
        alt="splash-bg"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.36 }}
      />

      <div className="ax-row" style={{ justifyContent: 'flex-end', zIndex: 1 }}>
        <Button variant="ghost" onClick={() => navigate('/welcome')}>
          Пропустить
        </Button>
      </div>

      <section className="ax-col" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '60dvh', gap: 20, zIndex: 1 }}>
        <SplashRive />
        <p className="p muted">Automation · AI · Optimization</p>
      </section>

      <div className="ax-col" style={{ gap: 6, textAlign: 'center', zIndex: 1 }}>
        <span className="ax-muted">Загрузка Mini App shell...</span>
      </div>
    </main>
  );
}
