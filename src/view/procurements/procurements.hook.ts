import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  procurementsService,
  CreateProcurementPayload,
  ListProcurementsParams,
} from '@/domain/procurements';

const KEY = ['procurements'] as const;

export function useProcurements(params?: ListProcurementsParams) {
  return useQuery({
    queryKey: [...KEY, params ?? {}],
    queryFn: () => procurementsService.list(params),
  });
}

export function useProcurement(id: string | undefined) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => procurementsService.findById(id!),
    enabled: !!id,
  });
}

export function useCreateProcurement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProcurementPayload) => procurementsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['articles'] });
      qc.invalidateQueries({ queryKey: ['warehouses'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
