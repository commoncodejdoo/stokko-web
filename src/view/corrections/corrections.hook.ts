import { useMutation, useQueryClient } from '@tanstack/react-query';
import { correctionsService, CreateCorrectionPayload } from '@/domain/corrections';

export function useCreateCorrection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCorrectionPayload) => correctionsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['articles'] });
      qc.invalidateQueries({ queryKey: ['warehouses'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
