import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/view/common/components/card.component';
import { Button } from '@/view/common/components/button.component';
import { Field } from '@/view/common/components/field.component';
import { Input } from '@/view/common/components/input.component';
import { BrandGlyph, BrandWordmark } from '@/view/common/components/brand-glyph.component';
import { useLogin, useFinalizeLoginSession } from './auth.hook';

const schema = z.object({
  email: z.string().email('Unesi ispravan e-mail.'),
  password: z.string().min(8, 'Lozinka mora imati barem 8 znakova.'),
});
type FormValues = z.infer<typeof schema>;

export function LoginScreen() {
  const navigate = useNavigate();
  const login = useLogin();
  const finalize = useFinalizeLoginSession();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    try {
      const result = await login.mutateAsync(values);
      if (result.requirePasswordChange) {
        navigate('/forced-password-change', {
          state: {
            passwordChangeToken: result.passwordChangeToken,
            firstName: result.user.firstName,
          },
        });
        return;
      }
      await finalize.mutateAsync({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
      navigate('/', { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Greška pri prijavi.';
      setSubmitError(message);
    }
  };

  const busy = isSubmitting || login.isPending || finalize.isPending;

  return (
    <div className="h-full w-full flex items-center justify-center bg-bg">
      <div className="w-[380px]">
        <div className="flex items-center justify-center gap-3 mb-8">
          <BrandGlyph size={36} />
          <BrandWordmark className="text-[22px]" />
        </div>
        <Card padding="lg">
          <h1 className="m-0 text-[18px] font-semibold">Prijava u Stokko</h1>
          <p className="m-0 mt-1 mb-5 text-2xs text-muted">Unesite svoje pristupne podatke</p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
            <Field label="E-mail" error={errors.email?.message}>
              <Input
                type="email"
                autoComplete="email"
                autoFocus
                invalid={Boolean(errors.email)}
                {...register('email')}
              />
            </Field>

            <Field label="Lozinka" error={errors.password?.message}>
              <Input
                type="password"
                autoComplete="current-password"
                invalid={Boolean(errors.password)}
                {...register('password')}
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
              Prijavi se
            </Button>
          </form>

          <div className="mt-5 pt-5 border-t border-border text-center text-2xs text-muted">
            Nemate račun?{' '}
            <a className="text-accent cursor-pointer hover:underline">Kontaktirajte prodaju</a>
          </div>
        </Card>
      </div>
    </div>
  );
}
