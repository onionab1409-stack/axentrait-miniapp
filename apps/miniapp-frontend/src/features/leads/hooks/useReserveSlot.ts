import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reserveBookingSlot } from '../../../shared/api/leadApi';

export function useReserveSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reserveBookingSlot,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['booking', 'slots'] });
      void queryClient.invalidateQueries({ queryKey: ['leads', 'my'] });
    },
  });
}
