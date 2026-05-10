import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  procurementsService,
  CreateProcurementPayload,
  ListProcurementsParams,
} from '@/domain/procurements';
import { toast } from '@/view/common/components/toast.component';

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
    onSuccess: (p) => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['articles'] });
      qc.invalidateQueries({ queryKey: ['warehouses'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Nabava evidentirana', `${p.items.length} stavki spremljeno`);
    },
    onError: (err) => toast.error('Greška pri spremanju nabave', (err as Error).message),
  });
}
