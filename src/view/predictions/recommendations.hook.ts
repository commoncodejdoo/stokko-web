import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { predictionsService } from '@/domain/predictions';
import { Urgency } from '@/domain/predictions/prediction-snapshot.domain';
import { toast } from '@/view/common/components/toast.component';

export interface RecommendationsFilter {
  warehouseId?: string;
  urgency?: Urgency;
  shouldReorderOnly?: boolean;
}

const KEY = ['recommendations'] as const;

export function useRecommendations(filter?: RecommendationsFilter) {
  return useQuery({
    queryKey: [...KEY, filter ?? {}],
    queryFn: () => predictionsService.listCurrent(filter),
  });
}

export function useRecomputeRecommendations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => predictionsService.recompute(),
    onSuccess: (s) => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success(
        'Preporuke izračunate',
        `${s.criticalCount} kritičnih · ${s.warningCount} upozorenja`,
      );
    },
    onError: (err) =>
      toast.error('Greška pri izračunu preporuka', (err as Error).message),
  });
}
