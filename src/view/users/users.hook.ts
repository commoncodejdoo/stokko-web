import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService, InviteUserPayload, UpdateUserPayload } from '@/domain/users';

const KEY = ['users'] as const;

export function useUsers() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => usersService.list(),
  });
}

export function useInviteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: InviteUserPayload) => usersService.invite(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      usersService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useReactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.reactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: (id: string) => usersService.resetPassword(id),
  });
}
