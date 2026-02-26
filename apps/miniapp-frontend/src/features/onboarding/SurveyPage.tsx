import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { MjImage } from '../../components/ui/MjImage';
import { trackEvent } from '../../shared/analytics/trackEvent';
import { fetchOnboardingConfig, submitOnboardingAnswers } from '../../shared/api/onboardingApi';
import { tgHapticLight } from '../../shared/telegram/tg';
import { useUiStore } from '../../shared/store/uiStore';
import { uid } from '../../shared/utils/id';
import type { OnboardingAnswerKey } from '../../shared/types/onboarding';
import { useOnboardingState } from './useOnboardingState';

function optionStyle(isSelected: boolean): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    borderRadius: 14,
    background: isSelected ? 'rgba(34,211,238,0.06)' : 'rgba(0,0,0,0.18)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 150ms ease',
    textAlign: 'left' as const,
    width: 'auto',          /* H5 FIX: force shrink-wrap, prevent block-level */
  };
}

export default function SurveyPage() {
  const navigate = useNavigate();
  const { answers, currentStep, setAnswer, setCurrentStep } = useOnboardingState();
  const pushToast = useUiStore((state) => state.pushToast);

  const onboardingQuery = useQuery({
    queryKey: ['onboarding-config'],
    queryFn: fetchOnboardingConfig,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const questions = onboardingQuery.data?.questions ?? [];
  const hasQuestions = questions.length > 0;
  const safeStep = hasQuestions ? Math.min(currentStep, questions.length - 1) : 0;
  const currentQuestion = hasQuestions ? questions[safeStep] : null;

  useEffect(() => {
    if (hasQuestions && safeStep !== currentStep) {
      setCurrentStep(safeStep);
    }
  }, [currentStep, hasQuestions, safeStep, setCurrentStep]);

  const questionKey = (currentQuestion?.key ?? null) as OnboardingAnswerKey | null;
  const selected = questionKey ? answers[questionKey] : undefined;
  const canContinue = Boolean(selected);
  const isLastStep = hasQuestions && safeStep === questions.length - 1;
  const actionLabel = useMemo(() => (isLastStep ? 'Получить план' : 'Далее'), [isLastStep]);

  const next = async () => {
    if (!currentQuestion || !selected || !questionKey) return;

    const completedAnswers = {
      ...answers,
      [questionKey]: selected,
    };

    trackEvent('onboarding_answered', {
      screen_id: 'SCR-ONB-020',
      step: safeStep + 1,
      question_key: questionKey,
    });

    if (isLastStep) {
      if (
        !completedAnswers.role ||
        !completedAnswers.industry ||
        !completedAnswers.companySize ||
        !completedAnswers.painArea ||
        !completedAnswers.goal
      ) {
        return;
      }

      try {
        await submitOnboardingAnswers(completedAnswers);
      } catch (err) {
        console.error('Onboarding submit error:', err);
        pushToast({
          id: uid('toast'),
          text: 'Не удалось сохранить ответы. Попробуйте ещё раз.',
          tone: 'error',
        });
      }

      trackEvent('onboarding_completed', { screen_id: 'SCR-ONB-020' });
      navigate('/onboarding/result');
      return;
    }

    setCurrentStep(safeStep + 1);
  };

  const back = () => {
    if (safeStep > 0) {
      setCurrentStep(safeStep - 1);
      return;
    }
    navigate('/welcome');
  };

  if (onboardingQuery.isLoading) {
    return (
      <AppShell title="Подбор решения" showBack onBack={back}>
        <Card>
          <div className="ax-col" style={{ gap: 12 }}>
            <h1 className="h2">Загружаем вопросы…</h1>
            <p className="p muted">Подождите пару секунд.</p>
          </div>
        </Card>
      </AppShell>
    );
  }

  if (onboardingQuery.isError || !hasQuestions || !currentQuestion) {
    return (
      <AppShell title="Подбор решения" showBack onBack={back}>
        <Card>
          <div className="ax-col" style={{ gap: 12 }}>
            <h1 className="h2">Не удалось загрузить вопросы</h1>
            <p className="p muted">Проверьте соединение и попробуйте снова.</p>
            <Button
              onClick={() => {
                void onboardingQuery.refetch();
              }}
            >
              Повторить
            </Button>
          </div>
        </Card>
      </AppShell>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Fullscreen background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <MjImage id="survey-bg" height="100%" borderRadius={0} scrim={false} alt="Survey bg" />
      </div>

      {/* Content overlay */}
      <div style={{
        position: 'relative', zIndex: 1,
        height: '100%', display: 'flex', flexDirection: 'column',
        padding: '64px 20px 20px',
        overflowY: 'auto',
      }}>
        <div className="ax-step-slide-left" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          {/* Dots + counter */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 6 }} aria-label="progress dots">
              {Array.from({ length: questions.length }).map((_, i) => {
                /* H4 FIX: solid dots — completed=semi, current=solid, future=dim */
                let bg: string;
                let shadow: string | undefined;
                if (i < safeStep) {
                  bg = 'rgba(34,211,238,0.5)';         /* H10 FIX: cyan instead of blue */
                } else if (i === safeStep) {
                  bg = '#22D3EE';                        /* H4 FIX: solid fill, no ring */
                  shadow = '0 0 8px rgba(34,211,238,0.4)';
                } else {
                  bg = 'rgba(240,246,252,0.2)';
                }
                return (
                  <span
                    key={`dot_${i}`}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: bg,
                      boxShadow: shadow,
                      transition: 'all 150ms ease',
                    }}
                  />
                );
              })}
            </div>
            <span style={{ fontSize: 12, color: 'rgba(126,232,242,0.4)' }}>
              {safeStep + 1}/{questions.length}
            </span>
          </div>

          {/* H3 FIX: maxWidth forces long titles to wrap to 2 lines */}
          <h2 style={{
            fontSize: 26,
            fontWeight: 300,
            color: '#7EE8F2',
            letterSpacing: '0.5px',
            textShadow: '0 0 30px rgba(34,211,238,0.2)',
            margin: 0,
            marginBottom: 16,
            maxWidth: '80%',
          }}>
            {currentQuestion.title}
          </h2>

          {/* H6 FIX: space-between distributes options evenly */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flex: 1,
            padding: '10px 0',
          }}>
            {currentQuestion.options.map((option) => {
              const isSelected = selected === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  style={optionStyle(isSelected)}
                  onClick={() => {
                    tgHapticLight();
                    if (questionKey) setAnswer(questionKey, option.value);
                  }}
                >
                  <span style={{ fontSize: 22, lineHeight: 1 }}>{option.icon}</span>
                  <span style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'rgba(126,232,242,0.55)',
                  }}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* H7 FIX: reduced padding for ~48px height instead of ~60px */}
          <Button
            variant="glassPrimary"
            size="lg"
            fullWidth
            disabled={!canContinue}
            onClick={() => {
              void next();
            }}
            style={{ marginTop: 16, padding: '12px 0', fontSize: 15, minHeight: 48 }}
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
