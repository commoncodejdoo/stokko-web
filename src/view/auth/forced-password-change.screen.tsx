import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@/view/common/components/card.component';
import { Button } from '@/view/common/components/button.component';
import { Field } from '@/view/common/components/field.component';
import { Input } from '@/view/common/components/input.component';
import { BrandGlyph, BrandWordmark } from '@/view/common/components/brand-glyph.component';
import { useForcedPasswordChange } from './auth.hook';

const schema = z
  .object({
    newPassword: z.string().min(8, 'Lozinka mora imati barem 8 znakova.'),
    confirm: z.string().min(8, 'Lozinka mora imati barem 8 znakova.'),
  })
  .refine((d) => d.newPassword === d.confirm, {
    path: ['confirm'],
    message: 'Lozinke se ne podudaraju.',
  });

type FormValues = z.infer<typeof schema>;

interface RouteState {
  passwordChangeToken?: string;
  firstName?: string;
}

export function ForcedPasswordChangeScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state ?? {}) as RouteState;
  const change = useForcedPasswordChange();
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!state.passwordChangeToken) {
      navigate('/login', { replace: true });
    }
  }, [state.passwordChangeToken, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: '', confirm: '' },
  });

  const onSubmit = async (values: FormValues) => {
    if (!state.passwordChangeToken) return;
    setSubmitError(null);
    try {
      await change.mutateAsync({
        passwordChangeToken: state.passwordChangeToken,
        newPassword: values.newPassword,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Greška pri promjeni lozinke.');
    }
  };

  const busy = isSubmitting || change.isPending;

  return (
    <div className="h-full w-full flex items-center justify-center bg-bg">
      <div className="w-[420px]">
        <div className="flex items-center justify-center gap-3 mb-8">
          <BrandGlyph size={36} />
          <BrandWordmark className="text-[22px]" />
        </div>
        <Card padding="lg">
          <h1 className="m-0 text-[18px] font-semibold">
            {state.firstName ? `Dobrodošli, ${state.firstName}!` : 'Promijeni lozinku'}
          </h1>
          <p className="m-0 mt-1 mb-5 text-2xs text-muted">
            Prije nego nastavite, postavite novu lozinku za svoj račun.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
            <Field label="Nova lozinka" error={errors.newPassword?.message}>
              <Input
                type="password"
                autoComplete="new-password"
                autoFocus
                invalid={Boolean(errors.newPassword)}
                {...register('newPassword')}
              />
            </Field>

            <Field label="Potvrda lozinke" error={errors.confirm?.message}>
              <Input
                type="password"
                autoComplete="new-password"
                invalid={Boolean(errors.confirm)}
                {...register('confirm')}
              />
            </Field>

            {submitError && (
              <div className="text-2xs text-danger -mt-1" role="alert">
                {submitError}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              full
              loading={busy}
              className="mt-2"
            >
              Spremi novu lozinku
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
