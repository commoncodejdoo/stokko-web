import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlayCircle } from 'lucide-react';
import { PageHeader } from '@/view/common/components/page-header.component';
import { Card } from '@/view/common/components/card.component';
import { SectionTitle } from '@/view/common/components/section-title.component';
import { Field } from '@/view/common/components/field.component';
import { Input } from '@/view/common/components/input.component';
import { Button } from '@/view/common/components/button.component';
import { Pill } from '@/view/common/components/pill.component';
import { useAuthStore } from '@/view/common/store/auth-store';
import { useTheme } from '@/view/common/theme/use-theme.hook';
import { useChangePassword } from '@/view/auth/change-password.hook';
import { ROLE_LABELS_HR } from '@/domain/common/role';
import { cn } from '@/view/common/utils/cn';
import { CategoriesPanel } from '@/view/categories/categories-panel.component';

type Tab = 'profil' | 'radni-prostor' | 'kategorije' | 'sigurnost' | 'izgled';

const TABS: { id: Tab; label: string }[] = [
  { id: 'profil', label: 'Profil' },
  { id: 'radni-prostor', label: 'Radni prostor' },
  { id: 'kategorije', label: 'Kategorije' },
  { id: 'sigurnost', label: 'Sigurnost' },
  { id: 'izgled', label: 'Izgled' },
];

export function SettingsScreen() {
  const [tab, setTab] = useState<Tab>('profil');
  const user = useAuthStore((s) => s.user);
  const organization = useAuthStore((s) => s.organization);

  return (
    <div>
      <PageHeader
        title="Postavke"
        sub="Konfiguracija računa i radnog prostora"
        breadcrumb="Postavke"
      />
      <div className="px-8 py-6 grid grid-cols-[200px_1fr] gap-8 max-w-[1100px]">
        <nav className="flex flex-col gap-0.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'px-3 py-2 text-left text-[13px] rounded-md transition-colors',
                tab === t.id
                  ? 'bg-accent-soft text-accent font-medium'
                  : 'text-text hover:bg-card-hi',
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="flex flex-col gap-5">
          {tab === 'profil' && (
            <Card padding="lg">
              <SectionTitle>Profil</SectionTitle>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <Field label="Ime">
                  <Input value={user?.firstName ?? ''} readOnly />
                </Field>
                <Field label="Prezime">
                  <Input value={user?.lastName ?? ''} readOnly />
                </Field>
                <Field label="E-mail" cols={2}>
                  <Input value={user?.email ?? ''} readOnly />
                </Field>
                <Field label="Uloga">
                  <Pill color={user?.role === 'OWNER' ? 'accent' : 'muted'}>
                    {user ? ROLE_LABELS_HR[user.role] : '—'}
                  </Pill>
                </Field>
              </div>
            </Card>
          )}

          {tab === 'radni-prostor' && (
            <Card padding="lg">
              <SectionTitle>Radni prostor</SectionTitle>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <Field label="Naziv" cols={2}>
                  <Input value={organization?.name ?? ''} readOnly />
                </Field>
                <Field label="Valuta">
                  <Input value={organization?.currency ?? 'EUR'} readOnly />
                </Field>
              </div>
              <p className="text-2xs text-muted mt-3 m-0">
                Naziv i valuta radnog prostora se postavljaju pri kreiranju i mogu se mijenjati
                samo iz administracijskog panela.
              </p>
            </Card>
          )}

          {tab === 'kategorije' && <CategoriesPanel />}

          {tab === 'sigurnost' && <SecurityPanel />}

          {tab === 'izgled' && <AppearancePanel />}
        </div>
      </div>
    </div>
  );
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Unesi trenutnu lozinku.'),
    newPassword: z.string().min(8, 'Nova lozinka mora imati barem 8 znakova.'),
    confirm: z.string().min(8, 'Potvrda mora imati barem 8 znakova.'),
  })
  .refine((d) => d.newPassword === d.confirm, {
    path: ['confirm'],
    message: 'Lozinke se ne podudaraju.',
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    path: ['newPassword'],
    message: 'Nova lozinka mora biti različita od trenutne.',
  });

type PasswordValues = z.infer<typeof passwordSchema>;

function SecurityPanel() {
  const change = useChangePassword();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirm: '' },
  });

  const onSubmit = async (values: PasswordValues) => {
    try {
      await change.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      reset();
    } catch {
      // toast in hook
    }
  };

  return (
    <Card padding="lg">
      <SectionTitle>Promijeni lozinku</SectionTitle>
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 mt-2">
        <Field label="Trenutna lozinka" error={errors.currentPassword?.message} cols={2}>
          <Input
            type="password"
            autoComplete="current-password"
            invalid={Boolean(errors.currentPassword)}
            {...register('currentPassword')}
          />
        </Field>
        <Field label="Nova lozinka" error={errors.newPassword?.message}>
          <Input
            type="password"
            autoComplete="new-password"
            invalid={Boolean(errors.newPassword)}
            {...register('newPassword')}
          />
        </Field>
        <Field label="Potvrda nove lozinke" error={errors.confirm?.message}>
          <Input
            type="password"
            autoComplete="new-password"
            invalid={Boolean(errors.confirm)}
            {...register('confirm')}
          />
        </Field>
        <div className="col-span-2 flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting || change.isPending}
          >
            Spremi novu lozinku
          </Button>
        </div>
      </form>
      <p className="text-2xs text-muted mt-4 m-0">
        Lozinka mora imati barem 8 znakova. Po promjeni se trenutna sesija zadržava — pri
        sljedećoj prijavi koristit ćete novu lozinku.
      </p>
    </Card>
  );
}

function AppearancePanel() {
  const navigate = useNavigate();
  const { preference, setPreference, isDark } = useTheme();
  return (
    <>
      <Card padding="lg">
        <SectionTitle>Izgled</SectionTitle>
        <div className="flex flex-col gap-3">
          <Field label="Tema">
            <div className="flex gap-2">
              {(['system', 'light', 'dark'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPreference(p)}
                  className={cn(
                    'px-3 py-1.5 text-[13px] rounded-md border transition-colors',
                    preference === p
                      ? 'bg-accent-soft text-accent border-accent/30'
                      : 'bg-card-hi text-text border-border',
                  )}
                >
                  {p === 'system' ? 'Sustavno' : p === 'light' ? 'Svijetla' : 'Tamna'}
                </button>
              ))}
            </div>
          </Field>
          <p className="text-2xs text-muted m-0">
            Trenutno aktivna:{' '}
            <span className="text-text font-medium">{isDark ? 'Tamna' : 'Svijetla'}</span>.
            Postavka se sprema u localStorage.
          </p>
        </div>
      </Card>
      <Card padding="lg">
        <SectionTitle>Onboarding</SectionTitle>
        <Button
          icon={<PlayCircle size={14} />}
          onClick={() => navigate('/onboarding?replay=1')}
        >
          Pogledaj uvod ponovo
        </Button>
      </Card>
    </>
  );
}
