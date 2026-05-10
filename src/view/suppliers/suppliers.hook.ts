import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  suppliersService,
  CreateSupplierPayload,
  UpdateSupplierPayload,
} from '@/domain/suppliers';
import { toast } from '@/view/common/components/toast.component';

const KEY = ['suppliers'] as const;

export function useSuppliers() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => suppliersService.list(),
  });
}

export function useSupplier(id: string | undefined) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => suppliersService.findById(id!),
    enabled: !!id,
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSupplierPayload) => suppliersService.create(payload),
    onSuccess: (s) => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Dobavljač stvoren', s.name);
    },
    onError: (err) => toast.error('Greška', (err as Error).message),
  });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSupplierPayload }) =>
      suppliersService.update(id, payload),
    onSuccess: (s) => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Dobavljač spremljen', s.name);
    },
    onError: (err) => toast.error('Greška', (err as Error).message),
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => suppliersService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Dobavljač obrisan');
    },
    onError: (err) => toast.error('Greška pri brisanju', (err as Error).message),
  });
}
