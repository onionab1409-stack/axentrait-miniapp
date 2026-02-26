import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <MjImage
        id="splash-bg"
        scrim={false}
        borderRadius={0}
        alt="splash-bg"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.36 }}
      />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <SplashRive />
        <p style={{
          fontSize: 12,
          color: 'rgba(240,246,252,0.35)',
          letterSpacing: '3px',
          fontFamily: "'SF Mono', Consolas, monospace",
          margin: 0,
          marginTop: 16,
        }}>
          Automation · AI · Optimization
        </p>
      </div>
    </div>
  );
}
