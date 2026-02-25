import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { trackEvent } from '../../shared/analytics/trackEvent';
import { fetchOnboardingConfig, submitOnboardingAnswers } from '../../shared/api/onboardingApi';
import { tgHapticLight } from '../../shared/telegram/tg';
import { useUiStore } from '../../shared/store/uiStore';
import { uid } from '../../shared/utils/id';
import type { OnboardingAnswerKey } from '../../shared/types/onboarding';
import { useOnboardingState } from './useOnboardingState';

function optionStyle(isSelected: boolean): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    padding: '14px 16px',
    borderRadius: 14,
    background: isSelected ? 'rgba(34, 211, 238, 0.06)' : 'rgba(255, 255, 255, 0.02)',
    border: `1px solid ${isSelected ? 'rgba(34, 211, 238, 0.25)' : 'rgba(255, 255, 255, 0.06)'}`,
    cursor: 'pointer',
    transition: 'all 200ms ease',
    marginBottom: 8,
    textAlign: 'left',
    color: 'var(--app-text)',
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
    <AppShell title="Подбор решения" showBack onBack={back}>
      <Card>
        <div className="ax-col ax-step-slide-left" style={{ gap: 12 }}>
          <div className="ax-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="ax-dots" aria-label="progress dots">
              {Array.from({ length: questions.length }).map((_, i) => {
                const stateClass = i < safeStep ? 'active' : i === safeStep ? 'current' : '';
                return <span key={`dot_${i}`} className={`ax-dot ${stateClass}`.trim()} />;
              })}
            </div>
            <span className="ax-muted" style={{ fontSize: 12 }}>
              {safeStep + 1}/{questions.length}
            </span>
          </div>

          <h1 className="h2">{currentQuestion.title}</h1>
          <p className="p muted">{currentQuestion.subtitle}</p>

          <div className="ax-col" style={{ gap: 8 }}>
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
                  <span style={{ fontSize: 18, lineHeight: 1 }}>{option.icon}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 14, fontWeight: 600 }}>{option.label}</span>
                    {option.description ? <span className="option-hint">{option.description}</span> : null}
                  </span>
                </button>
              );
            })}
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!canContinue}
            onClick={() => {
              void next();
            }}
            style={{ marginTop: 20 }}
          >
            {actionLabel}
          </Button>
        </div>
      </Card>
    </AppShell>
  );
}
