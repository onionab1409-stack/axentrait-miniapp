import { useQuery } from '@tanstack/react-query';
import { fetchCase } from '../../../shared/api/contentApi';

export function useCase(id?: string) {
  return useQuery({
    queryKey: ['content', 'case', id],
    queryFn: () => fetchCase(id || ''),
    enabled: Boolean(id),
    staleTime: 5 * 60_000,
  });
}
