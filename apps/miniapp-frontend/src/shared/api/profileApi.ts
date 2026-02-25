import { apiFetch } from './apiClient';
import type { OnboardingAnswers } from '../types/onboarding';

type UserProfile = {
  userId: string;
  role?: string | null;
  industry?: string | null;
  companySize?: string | null;
  painArea?: string | null;
  goal?: string | null;
  budgetRange?: string | null;
  timeline?: string | null;
  segments: string[];
  updatedAt: string;
};

export type MeResponse = {
  id: string;
  telegramUserId: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  languageCode?: string | null;
  createdAt: string;
  updatedAt: string;
  profile: UserProfile | null;
};

export async function fetchMe(): Promise<MeResponse | null> {
  return apiFetch<MeResponse>('/me');
}

export async function submitOnboardingAnswers(
  answers: OnboardingAnswers,
): Promise<{ profile: UserProfile; segments: string[] }> {
  return apiFetch<{ profile: UserProfile; segments: string[] }>('/onboarding/answers', {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
}
