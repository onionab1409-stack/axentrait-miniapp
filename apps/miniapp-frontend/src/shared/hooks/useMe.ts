import { useQuery } from '@tanstack/react-query';
import { fetchMe } from '../api/profileApi';

export function useMe(enabled = true) {
  return useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    enabled,
    staleTime: 60_000,
  });
}
