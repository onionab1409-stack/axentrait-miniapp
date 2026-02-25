import { useQuery } from '@tanstack/react-query';
import { fetchBookingSlots } from '../../../shared/api/leadApi';

export function useBookingSlots(from?: string, to?: string, enabled = true) {
  return useQuery({
    queryKey: ['booking', 'slots', from, to],
    queryFn: () => fetchBookingSlots(from, to),
    enabled,
    staleTime: 60_000,
  });
}
