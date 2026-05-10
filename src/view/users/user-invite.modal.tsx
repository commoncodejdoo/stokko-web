import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, Copy } from 'lucide-react';
import { Modal } from '@/view/common/components/modal.component';
import { Field } from '@/view/common/components/field.component';
import { Input } from '@/view/common/components/input.component';
import { Button } from '@/view/common/components/button.component';
import { Role, ROLE_LABELS_HR } from '@/domain/common/role';
import { useInviteUser } from './users.hook';

const schema = z.object({
  email: z.string().email('Unesi ispravan e-mail.'),
  firstName: z.string().trim().min(2, 'Ime mora imati barem 2 znaka.'),
  lastName: z.string().trim().min(2, 'Prezime mora imati barem 2 znaka.'),
  role: z.enum(['OWNER', 'ADMIN', 'EMPLOYEE']),
});
type FormValues = z.infer<typeof schema>;

interface UserInviteModalProps {
  open: boolean;
  onOpenChange(open: boolean): void;
}

export function UserInviteModal({ open, onOpenChange }: UserInviteModalProps) {
  const invite = useInviteUser();
  const [revealedPassword, setRevealedPassword] = useState<{
    password: string;
    email: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      role: 'EMPLOYEE',
    },
  });

  useEffect(() => {
    if (open) {
      reset({ email: '', firstName: '', lastName: '', role: 'EMPLOYEE' });
      setRevealedPassword(null);
      setCopied(false);
    }
  }, [open, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      const result = await invite.mutateAsync(values);
      setRevealedPassword({
        password: result.temporaryPassword,
        email: values.email,
      });
    } catch {
      // shown inline
    }
  };

  const handleCopy = async () => {
    if (!revealedPassword) return;
    try {
      await navigator.clipboard.writeText(revealedPassword.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // copy not available
    }
  };

  const role = watch('role');

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={revealedPassword ? 'Korisnik je dodan' : 'Pozovi novog korisnika'}
      size="md"
      footer={
        revealedPassword ? (
          <Button variant="primary" onClick={() => onOpenChange(false)}>
            Gotovo
          </Button>
        ) : (
          <>
            <Button onClick={() => onOpenChange(false)} disabled={invite.isPending}>
              Odustani
            </Button>
            <Button variant="primary" onClick={handleSubmit(onSubmit)} loading={invite.isPending}>
              Pozovi
            </Button>
          </>
        )
      }
    >
      {revealedPassword ? (
        <div className="flex flex-col gap-3">
          <p className="text-2xs text-muted m-0">
            Privremena lozinka za <span className="font-medium text-text">{revealedPassword.email}</span>{' '}
            generirana je. Pošalji je korisniku — pri prvoj prijavi morat će ju zamijeniti.
            <br />
            <span className="text-warning">Ovaj prikaz je jednokratan.</span>
          </p>
          <div className="flex items-center gap-2 p-3 bg-card-hi border border-border rounded-md">
            <code className="flex-1 font-mono text-[14px] tracking-wider">
              {revealedPassword.password}
            </code>
            <Button
              size="xs"
              icon={copied ? <Check size={13} /> : <Copy size={13} />}
              onClick={handleCopy}
            >
              {copied ? 'Kopirano' : 'Kopiraj'}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          <Field label="Ime" error={errors.firstName?.message}>
            <Input autoFocus invalid={Boolean(errors.firstName)} {...register('firstName')} />
          </Field>
          <Field label="Prezime" error={errors.lastName?.message}>
            <Input invalid={Boolean(errors.lastName)} {...register('lastName')} />
          </Field>
          <Field label="E-mail" error={errors.email?.message} cols={2}>
            <Input type="email" invalid={Boolean(errors.email)} {...register('email')} />
          </Field>
          <Field label="Uloga" cols={2}>
            <div className="flex gap-2">
              {(['EMPLOYEE', 'ADMIN', 'OWNER'] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setValue('role', r, { shouldDirty: true })}
                  className={
                    'flex-1 px-3 py-1.5 text-[13px] rounded-md border transition-colors ' +
                    (role === r
                      ? 'bg-accent-soft text-accent border-accent/30'
                      : 'bg-card-hi text-text border-border')
                  }
                >
                  {ROLE_LABELS_HR[r]}
                </button>
              ))}
            </div>
          </Field>
          {invite.error && (
            <div className="col-span-2 text-2xs text-danger" role="alert">
              {(invite.error as Error).message}
            </div>
          )}
        </form>
      )}
    </Modal>
  );
}
