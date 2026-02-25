import { useEffect, useMemo, useState } from 'react';
import { onboardingQuestions } from '../../shared/data';
import { tgCloudGet, tgCloudSet } from '../../shared/telegram/cloudStorage';
import type { OnboardingAnswers, OnboardingAnswerKey } from '../../shared/types/onboarding';

const STORAGE_KEY = 'axentrait.onboarding.answers';
const STEP_KEY = 'axentrait.onboarding.step';

export function useOnboardingState() {
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [currentStep, setCurrentStepState] = useState(0);
  const total = onboardingQuestions.length;
  const maxStep = Math.max(total - 1, 0);

  function clampStep(step: number): number {
    if (!Number.isFinite(step)) return 0;
    if (step < 0) return 0;
    if (step > maxStep) return maxStep;
    return step;
  }

  function firstIncompleteStep(state: OnboardingAnswers): number {
    const index = onboardingQuestions.findIndex((q) => !state[q.key as OnboardingAnswerKey]);
    if (index < 0) return maxStep;
    return clampStep(index);
  }

  useEffect(() => {
    let cancelled = false;

    let nextAnswers: OnboardingAnswers = {};
    let nextStep = 0;

    const localAnswersRaw = localStorage.getItem(STORAGE_KEY);
    const localStepRaw = localStorage.getItem(STEP_KEY);
    const hasLocalSnapshot = localAnswersRaw !== null || localStepRaw !== null;

    if (localAnswersRaw) {
      try {
        nextAnswers = JSON.parse(localAnswersRaw) as OnboardingAnswers;
      } catch {
        // ignore malformed local state
      }
    }

    if (localStepRaw) {
      nextStep = clampStep(Number(localStepRaw));
    }

    nextStep = Math.min(nextStep, firstIncompleteStep(nextAnswers));

    setAnswers(nextAnswers);
    setCurrentStepState(nextStep);

    void (async () => {
      if (hasLocalSnapshot) {
        return;
      }

      const [cloudAnswersRaw, cloudStepRaw] = await Promise.all([
        tgCloudGet('onboarding.answers'),
        tgCloudGet('onboarding.step'),
      ]);

      if (cancelled) return;

      let cloudAnswers: OnboardingAnswers = {};
      let cloudStep = nextStep;

      if (cloudAnswersRaw) {
        try {
          cloudAnswers = JSON.parse(cloudAnswersRaw) as OnboardingAnswers;
        } catch {
          // ignore malformed cloud state
        }
      }

      if (cloudStepRaw) {
        cloudStep = clampStep(Number(cloudStepRaw));
      }

      const safeStep = Math.min(cloudStep, firstIncompleteStep(cloudAnswers));
      setAnswers(cloudAnswers);
      setCurrentStepState(safeStep);
    })();

    return () => {
      cancelled = true;
    };
  }, [maxStep]);

  useEffect(() => {
    const safeStep = Math.min(currentStep, firstIncompleteStep(answers));
    if (safeStep !== currentStep) {
      setCurrentStepState(safeStep);
    }
  }, [answers, currentStep]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    void tgCloudSet('onboarding.answers', JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    localStorage.setItem(STEP_KEY, String(currentStep));
    void tgCloudSet('onboarding.step', String(currentStep));
  }, [currentStep]);

  const currentQuestion = useMemo(() => onboardingQuestions[currentStep], [currentStep]);

  function setCurrentStep(step: number) {
    setCurrentStepState(clampStep(step));
  }

  function setAnswer(key: OnboardingAnswerKey, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  async function reset() {
    const clearedAnswers: OnboardingAnswers = {};
    setAnswers(clearedAnswers);
    setCurrentStepState(0);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clearedAnswers));
    localStorage.setItem(STEP_KEY, '0');
    await Promise.all([tgCloudSet('onboarding.answers', JSON.stringify(clearedAnswers)), tgCloudSet('onboarding.step', '0')]);
  }

  return {
    answers,
    currentQuestion,
    currentStep,
    total,
    setAnswer,
    setCurrentStep,
    reset,
  };
}
