import { useQuery } from '@tanstack/react-query';
import { fetchServices } from '../../../shared/api/contentApi';

export function useServices() {
  return useQuery({
    queryKey: ['content', 'services'],
    queryFn: fetchServices,
    staleTime: 5 * 60_000,
  });
}
