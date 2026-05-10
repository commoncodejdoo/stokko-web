import { useQuery } from '@tanstack/react-query';
import { categoriesService } from '@/domain/categories';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.list(),
  });
}
