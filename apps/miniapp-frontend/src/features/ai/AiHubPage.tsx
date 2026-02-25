import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MjImage } from '../../components/ui/MjImage';
import { SplineScene } from '../../components/ui/SplineScene';
import { SPLINE_SCENES } from '../../config/splineScenes';
import { scenarioMeta } from '../../shared/data';
import { track } from '../../shared/analytics/track';

function scenarioCardStyle(): React.CSSProperties {
  return {
    padding: 18,
    borderRadius: 16,
    background: 'rgba(12, 22, 32, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    cursor: 'pointer',
    marginBottom: 10,
    transition: 'all 200ms ease',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  };
}

const iconCircleStyle: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 12,
  background: 'linear-gradient(145deg, rgba(34, 211, 238, 0.1), rgba(5, 16, 25, 0.8))',
  border: '1px solid rgba(34, 211, 238, 0.15)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  boxShadow: '0 0 12px rgba(34, 211, 238, 0.06)',
  fontSize: 20,
};

export default function AiHubPage() {
  const navigate = useNavigate();

  useEffect(() => {
    track('ai_hub_opened', { screen_id: 'SCR-AI-001' });
  }, []);

  const splineUrl = SPLINE_SCENES['ai-hub'];

  return (
    <AppShell title="AI-демо" showBottomNav>
      <section className="ax-hero" style={{ minHeight: 220 }}>
        <SplineScene
          sceneUrl={splineUrl}
          style={{ position: 'absolute', inset: 0, height: '100%' }}
          fallback={<MjImage id="hero-ai-hub" alt="AI hub hero" borderRadius={0} scrim={false} style={{ width: '100%', height: '100%' }} />}
        />
        <div className="ax-scrim" />
        <div className="ax-hero-content ax-col" style={{ gap: 8 }}>
          <h1 className="h2" style={{ color: '#fff' }}>
            Задайте вопрос искусственному интеллекту
          </h1>
          <p className="p" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Выберите сценарий и протестируйте AI на своей задаче.
          </p>
        </div>
      </section>

      <div className="ax-col" style={{ gap: 10 }}>
        {scenarioMeta.map((scenario) => (
          <div
            key={scenario.key}
            style={scenarioCardStyle()}
            onClick={() => {
              track('ai_scenario_selected', { scenario_id: scenario.key });
              navigate(`/ai/chat/new?scenario=${encodeURIComponent(scenario.key)}`);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                track('ai_scenario_selected', { scenario_id: scenario.key });
                navigate(`/ai/chat/new?scenario=${encodeURIComponent(scenario.key)}`);
              }
            }}
          >
            <div style={iconCircleStyle}>{scenario.icon}</div>
            <div className="ax-col" style={{ gap: 4, flex: 1 }}>
              <div className="ax-row" style={{ justifyContent: 'space-between', gap: 8 }}>
                <strong style={{ fontSize: 16 }}>{scenario.displayName}</strong>
                <span className="ax-muted" style={{ fontSize: 12 }}>
                  {scenario.estimatedTime}
                </span>
              </div>
              <span style={{ fontSize: 14, color: 'rgba(240, 246, 252, 0.68)' }}>{scenario.displayDescription}</span>
              <span style={{ fontSize: 12, color: 'rgba(240, 246, 252, 0.45)' }}>{scenario.requiredInputHint}</span>
            </div>
          </div>
        ))}
      </div>

      <Card variant="glass">
        <div className="ax-col" style={{ gap: 10 }}>
          <h2 className="h2" style={{ fontSize: 20, margin: 0 }}>
            Свободный чат
          </h2>
          <p className="p muted" style={{ margin: 0 }}>
            Если не хотите выбирать сценарий, начните обычный диалог.
          </p>
          <Button onClick={() => navigate('/ai/chat/new?scenario=ai.scenario.faq')} variant="secondary">
            Открыть чат
          </Button>
        </div>
      </Card>
    </AppShell>
  );
}
