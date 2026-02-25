import { useQuery } from '@tanstack/react-query';
import { fetchService } from '../../../shared/api/contentApi';

export function useService(id?: string) {
  return useQuery({
    queryKey: ['content', 'service', id],
    queryFn: () => fetchService(id || ''),
    enabled: Boolean(id),
    staleTime: 5 * 60_000,
  });
}
