import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService, InviteUserPayload, UpdateUserPayload } from '@/domain/users';
import { toast } from '@/view/common/components/toast.component';

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
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Korisnik pozvan', result.user.fullName);
    },
    onError: (err) => toast.error('Greška', (err as Error).message),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      usersService.update(id, payload),
    onSuccess: (u) => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Korisnik spremljen', u.fullName);
    },
    onError: (err) => toast.error('Greška', (err as Error).message),
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.deactivate(id),
    onSuccess: (u) => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.info('Korisnik deaktiviran', u.fullName);
    },
    onError: (err) => toast.error('Greška', (err as Error).message),
  });
}

export function useReactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.reactivate(id),
    onSuccess: (u) => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Korisnik reaktiviran', u.fullName);
    },
    onError: (err) => toast.error('Greška', (err as Error).message),
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: (id: string) => usersService.resetPassword(id),
    onError: (err) => toast.error('Greška pri resetiranju lozinke', (err as Error).message),
  });
}
