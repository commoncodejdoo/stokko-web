import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { shoppingListsService } from '@/domain/shopping-lists';
import {
  AddShoppingListItemPayload,
  UpdateShoppingListItemPayload,
} from '@/domain/shopping-lists/shopping-lists.repository';
import { toast } from '@/view/common/components/toast.component';

const KEY = ['shopping-lists'] as const;
const ACTIVE = [...KEY, 'active'] as const;
const detailKey = (id: string) => [...KEY, 'detail', id] as const;

export function useActiveShoppingList() {
  return useQuery({
    queryKey: ACTIVE,
    queryFn: () => shoppingListsService.getActive(),
  });
}

export function useShoppingList(id: string | undefined) {
  return useQuery({
    queryKey: id ? detailKey(id) : [...KEY, 'detail', 'none'],
    queryFn: () => shoppingListsService.findById(id!),
    enabled: !!id,
  });
}

export function useCreateShoppingList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => shoppingListsService.create(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: (err) =>
      toast.error('Greška pri kreiranju liste', (err as Error).message),
  });
}

export function useUpdateShoppingListItem(listId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      payload,
    }: {
      itemId: string;
      payload: UpdateShoppingListItemPayload;
    }) =>
      listId
        ? shoppingListsService.updateItem(listId, itemId, payload)
        : Promise.reject(new Error('listId required')),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
}

export function useAddShoppingListItem(listId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddShoppingListItemPayload) =>
      listId
        ? shoppingListsService.addItem(listId, payload)
        : Promise.reject(new Error('listId required')),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
}

export function useRemoveShoppingListItem(listId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) =>
      listId
        ? shoppingListsService.removeItem(listId, itemId)
        : Promise.reject(new Error('listId required')),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
}

export function useCompleteShoppingList(listId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      listId
        ? shoppingListsService.complete(listId)
        : Promise.reject(new Error('listId required')),
    onSuccess: ({ procurementIds }) => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['recommendations'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['procurements'] });
      toast.success(
        'Lista dovršena',
        `${procurementIds.length} nabav${procurementIds.length === 1 ? 'a' : 'e'} kreirano`,
      );
    },
    onError: (err) =>
      toast.error('Greška pri dovršavanju liste', (err as Error).message),
  });
}

export function useCancelShoppingList(listId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      listId
        ? shoppingListsService.cancel(listId)
        : Promise.reject(new Error('listId required')),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Lista otkazana');
    },
  });
}
