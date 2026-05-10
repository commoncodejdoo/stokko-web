import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  transfersService,
  CreateTransferPayload,
  ListTransfersParams,
} from '@/domain/transfers';
import { toast } from '@/view/common/components/toast.component';

const KEY = ['transfers'] as const;

export function useTransfers(params?: ListTransfersParams) {
  return useQuery({
    queryKey: [...KEY, params ?? {}],
    queryFn: () => transfersService.list(params),
  });
}

export function useTransfer(id: string | undefined) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => transfersService.findById(id!),
    enabled: !!id,
  });
}

export function useCreateTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTransferPayload) => transfersService.create(payload),
    onSuccess: (t) => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['articles'] });
      qc.invalidateQueries({ queryKey: ['warehouses'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Premještaj zabilježen', `${t.items.length} stavki prebačeno`);
    },
    onError: (err) => toast.error('Greška pri premještaju', (err as Error).message),
  });
}
