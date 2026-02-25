import { useQuery } from '@tanstack/react-query';
import { fetchCases } from '../../../shared/api/contentApi';

export function useCases() {
  return useQuery({
    queryKey: ['content', 'cases'],
    queryFn: fetchCases,
    staleTime: 5 * 60_000,
  });
}
