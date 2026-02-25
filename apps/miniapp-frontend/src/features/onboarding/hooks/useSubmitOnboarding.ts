import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { OnboardingAnswers } from '../../../shared/types/onboarding';
import { submitOnboardingAnswers } from '../../../shared/api/profileApi';

export function useSubmitOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (answers: OnboardingAnswers) => submitOnboardingAnswers(answers),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
