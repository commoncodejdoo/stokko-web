import { useMutation, useQuery } from '@tanstack/react-query';
import { narrativesService } from '@/domain/narratives';

export function useDailyDigest(date?: string) {
  return useQuery({
    queryKey: ['narratives', 'digest', date ?? 'today'],
    queryFn: () => narrativesService.getDailyDigest(date),
    staleTime: 60 * 60 * 1000,
  });
}

export function useExplainItem() {
  return useMutation({
    mutationFn: ({
      articleId,
      warehouseId,
    }: {
      articleId: string;
      warehouseId: string;
    }) => narrativesService.explain(articleId, warehouseId),
  });
}
