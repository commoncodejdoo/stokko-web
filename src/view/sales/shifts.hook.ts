import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shiftsService, CloseShiftPayload, ListShiftsParams } from '@/domain/sales';
import { toast } from '@/view/common/components/toast.component';

const KEY = ['shifts'] as const;

export function useShifts(params?: ListShiftsParams) {
  return useQuery({
    queryKey: [...KEY, params ?? {}],
    queryFn: () => shiftsService.list(params),
  });
}

export function useShift(id: string | undefined) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => shiftsService.findById(id!),
    enabled: !!id,
  });
}

export function useCloseShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CloseShiftPayload) => shiftsService.close(payload),
    onSuccess: ({ shift }) => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['articles'] });
      qc.invalidateQueries({ queryKey: ['warehouses'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['sales-report'] });
      toast.success(
        'Smjena zatvorena',
        `${shift.totalQuantity} stavki · ${shift.totalRevenue} ${shift.currency}`,
      );
    },
    onError: (err) => toast.error('Greška pri zatvaranju smjene', (err as Error).message),
  });
}

export function useDeleteShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shiftsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['sales-report'] });
      toast.success('Smjena obrisana');
    },
    onError: (err) => toast.error('Greška pri brisanju', (err as Error).message),
  });
}
