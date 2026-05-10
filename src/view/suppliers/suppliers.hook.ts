import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  suppliersService,
  CreateSupplierPayload,
  UpdateSupplierPayload,
} from '@/domain/suppliers';

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
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSupplierPayload }) =>
      suppliersService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => suppliersService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
