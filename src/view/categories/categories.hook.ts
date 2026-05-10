import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  categoriesService,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '@/domain/categories';
import { toast } from '@/view/common/components/toast.component';

const KEY = ['categories'] as const;

export function useCategories() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => categoriesService.list(),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => categoriesService.create(payload),
    onSuccess: (c) => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Kategorija stvorena', c.name);
    },
    onError: (err) => toast.error('Greška', (err as Error).message),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) =>
      categoriesService.update(id, payload),
    onSuccess: (c) => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Kategorija spremljena', c.name);
    },
    onError: (err) => toast.error('Greška', (err as Error).message),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['articles'] });
      toast.success('Kategorija obrisana');
    },
    onError: (err) => toast.error('Greška pri brisanju', (err as Error).message),
  });
}
