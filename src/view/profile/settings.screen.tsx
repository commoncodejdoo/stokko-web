import { useState } from 'react';
import { PageHeader } from '@/view/common/components/page-header.component';
import { Card } from '@/view/common/components/card.component';
import { SectionTitle } from '@/view/common/components/section-title.component';
import { Field } from '@/view/common/components/field.component';
import { Input } from '@/view/common/components/input.component';
import { Spinner } from '@/view/common/components/spinner.component';
import { Pill } from '@/view/common/components/pill.component';
import { useAuthStore } from '@/view/common/store/auth-store';
import { useCategories } from '@/view/categories/categories.hook';
import { useTheme } from '@/view/common/theme/use-theme.hook';
import { ROLE_LABELS_HR } from '@/domain/common/role';
import { cn } from '@/view/common/utils/cn';

type Tab = 'profil' | 'radni-prostor' | 'kategorije' | 'izgled';

const TABS: { id: Tab; label: string }[] = [
  { id: 'profil', label: 'Profil' },
  { id: 'radni-prostor', label: 'Radni prostor' },
  { id: 'kategorije', label: 'Kategorije' },
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

          {tab === 'izgled' && <AppearancePanel />}
        </div>
      </div>
    </div>
  );
}

function CategoriesPanel() {
  const categories = useCategories();
  return (
    <Card padding="lg">
      <SectionTitle>Kategorije</SectionTitle>
      {categories.isPending ? (
        <div className="flex items-center justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {categories.data?.map((c) => (
            <Pill key={c.id} color={c.isPredefined ? 'muted' : 'accent'}>
              {c.name}
            </Pill>
          ))}
        </div>
      )}
      <p className="text-2xs text-muted mt-4 m-0">
        Kategorije se trenutno mogu samo pregledavati. CRUD interakcija dolazi u sljedećoj fazi.
      </p>
    </Card>
  );
}

function AppearancePanel() {
  const { preference, setPreference, isDark } = useTheme();
  return (
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
          Trenutno aktivna: <span className="text-text font-medium">{isDark ? 'Tamna' : 'Svijetla'}</span>.
          Postavka se sprema u localStorage radnog uređaja.
        </p>
      </div>
    </Card>
  );
}
