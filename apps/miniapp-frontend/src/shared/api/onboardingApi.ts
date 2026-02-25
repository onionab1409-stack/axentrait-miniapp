import { apiFetch } from './apiClient';
import type { OnboardingAnswers, OnboardingQuestion } from '../types/onboarding';

function hasRequiredAnswers(answers: OnboardingAnswers): answers is Required<OnboardingAnswers> {
  return Boolean(answers.role && answers.industry && answers.companySize && answers.painArea && answers.goal);
}

export type OnboardingConfig = {
  questions: OnboardingQuestion[];
  [key: string]: unknown;
};

export async function fetchOnboardingConfig() {
  return apiFetch<OnboardingConfig>('/onboarding');
}

export async function submitOnboardingAnswers(answers: OnboardingAnswers) {
  if (!hasRequiredAnswers(answers)) {
    throw new Error('Onboarding answers are incomplete');
  }

  return apiFetch<{ ok: boolean; data?: unknown }>('/onboarding/answers', {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
}
