import { useQuery } from '@tanstack/react-query';
import { fetchMyLeads } from '../../../shared/api/leadApi';

export function useMyLeads(enabled = true) {
  return useQuery({
    queryKey: ['leads', 'my'],
    queryFn: fetchMyLeads,
    enabled,
    staleTime: 60_000,
  });
}
