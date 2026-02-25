import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { MjImage } from '../../components/ui/MjImage';
import { SplineScene } from '../../components/ui/SplineScene';
import { SPLINE_SCENES } from '../../config/splineScenes';
import { onboardingContent } from '../../shared/data';
import { trackEvent } from '../../shared/analytics/trackEvent';
import { useTgMainButton } from '../../shared/telegram/useTgMainButton';
import { useOnboardingState } from './useOnboardingState';

export default function WelcomePage() {
  const navigate = useNavigate();
  const welcome = onboardingContent.welcome;
  const { reset } = useOnboardingState();

  const startOnboarding = () => {
    void reset();
    trackEvent('onboarding_started', { screen_id: 'SCR-ONB-010' });
    navigate('/onboarding');
  };

  const openCases = () => {
    navigate('/cases');
  };

  useTgMainButton({
    visible: false,
    enabled: false,
  });

  const splineUrl = SPLINE_SCENES['welcome'];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Full-screen background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        {splineUrl ? (
          <SplineScene
            sceneUrl={splineUrl}
            style={{ width: '100%', height: '100%' }}
            fallback={
              <MjImage
                id="hero-main"
                height="100%"
                borderRadius={0}
                scrim={false}
                alt="Welcome hero"
              />
            }
          />
        ) : (
          <MjImage
            id="hero-main"
            height="100%"
            borderRadius={0}
            scrim={false}
            alt="Welcome hero"
          />
        )}
        {/* Darken overlay for readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(5,10,15,0.45) 0%, rgba(5,10,15,0.25) 40%, rgba(5,10,15,0.7) 75%, rgba(5,10,15,0.92) 100%)',
          }}
        />
      </div>

      {/* Content overlay */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: '0 24px',
        }}
      >
        {/* Headline in upper third */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 60,
            paddingBottom: 20,
          }}
        >
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              lineHeight: 1.25,
              color: '#fff',
              textAlign: 'center',
              margin: 0,
              maxWidth: 340,
            }}
          >
            {welcome.headline}
          </h1>
        </div>

        {/* Buttons pinned to bottom */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            paddingBottom: 48,
          }}
        >
          <Button variant="primary" size="lg" fullWidth onClick={startOnboarding}>
            {welcome.ctaButton}
          </Button>
          <Button variant="secondary" size="lg" fullWidth onClick={openCases}>
            Смотреть кейсы
          </Button>
        </div>
      </div>
    </div>
  );
}
