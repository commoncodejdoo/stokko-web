import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  warehousesService,
  CreateWarehousePayload,
  UpdateWarehousePayload,
} from '@/domain/warehouses';
import { toast } from '@/view/common/components/toast.component';

const KEY = ['warehouses'] as const;

export function useWarehouses() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => warehousesService.list(),
  });
}

export function useWarehouse(id: string | undefined) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => warehousesService.findById(id!),
    enabled: !!id,
  });
}

export function useWarehouseArticles(id: string | undefined) {
  return useQuery({
    queryKey: [...KEY, id, 'articles'],
    queryFn: () => warehousesService.getArticles(id!),
    enabled: !!id,
  });
}

export function useCreateWarehouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWarehousePayload) => warehousesService.create(payload),
    onSuccess: (w) => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Skladište stvoreno', w.name);
    },
    onError: (err) => toast.error('Greška', (err as Error).message),
  });
}

export function useUpdateWarehouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateWarehousePayload }) =>
      warehousesService.update(id, payload),
    onSuccess: (w, vars) => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: [...KEY, vars.id] });
      toast.success('Skladište spremljeno', w.name);
    },
    onError: (err) => toast.error('Greška', (err as Error).message),
  });
}

export function useDeleteWarehouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => warehousesService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Skladište obrisano');
    },
    onError: (err) => toast.error('Greška pri brisanju', (err as Error).message),
  });
}
