import { useMutation } from '@tanstack/react-query';
import { authService } from '@/domain/auth';
import { toast } from '@/view/common/components/toast.component';

export interface ChangePasswordVariables {
  currentPassword: string;
  newPassword: string;
}

export const useChangePassword = () =>
  useMutation({
    mutationFn: (vars: ChangePasswordVariables) =>
      authService.changePassword(vars.currentPassword, vars.newPassword),
    onSuccess: () => {
      toast.success('Lozinka promijenjena', 'Pri sljedećoj prijavi koristit ćete novu lozinku.');
    },
    onError: (err) => toast.error('Greška pri promjeni lozinke', (err as Error).message),
  });
