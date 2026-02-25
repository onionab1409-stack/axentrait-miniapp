import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { LeadPayload } from '../../../shared/api/leadApi';
import { submitLead } from '../../../shared/api/leadApi';

export function useSubmitLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LeadPayload) => submitLead(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['leads', 'my'] });
    },
  });
}
