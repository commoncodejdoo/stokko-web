import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { RotateCw, UserX, UserCheck, Check, Copy, Save } from 'lucide-react';
import { PageHeader } from '@/view/common/components/page-header.component';
import { Button } from '@/view/common/components/button.component';
import { Card } from '@/view/common/components/card.component';
import { SectionTitle } from '@/view/common/components/section-title.component';
import { Spinner } from '@/view/common/components/spinner.component';
import { Pill } from '@/view/common/components/pill.component';
import { Avatar } from '@/view/common/components/avatar.component';
import { Field } from '@/view/common/components/field.component';
import { Input } from '@/view/common/components/input.component';
import { Modal } from '@/view/common/components/modal.component';
import { useAuthStore } from '@/view/common/store/auth-store';
import { canManageUsers, ROLE_LABELS_HR, Role } from '@/domain/common/role';
import {
  useUsers,
  useUpdateUser,
  useDeactivateUser,
  useReactivateUser,
  useResetUserPassword,
} from './users.hook';
import { cn } from '@/view/common/utils/cn';

const ROLE_PILL_COLOR = {
  OWNER: 'accent',
  ADMIN: 'success',
  EMPLOYEE: 'muted',
} as const;

export function UserDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const role = currentUser?.role;
  const canManage = role ? canManageUsers(role) : false;

  const users = useUsers();
  const update = useUpdateUser();
  const deactivate = useDeactivateUser();
  const reactivate = useReactivateUser();
  const resetPassword = useResetUserPassword();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [newRole, setNewRole] = useState<Role | ''>('');
  const [revealed, setRevealed] = useState<{ password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  if (users.isPending) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  const user = users.data?.find((u) => u.id === id);
  if (!user) {
    return (
      <div className="px-8 py-6">
        <Card padding="lg">
          <div className="text-danger text-2xs">Korisnik nije pronađen.</div>
        </Card>
      </div>
    );
  }

  // Hydrate form once we have user data
  const initFirst = firstName === '' ? user.firstName : firstName;
  const initLast = lastName === '' ? user.lastName : lastName;
  const initRole: Role = newRole === '' ? user.role : newRole;

  const isSelf = user.id === currentUser?.id;
  const dirty =
    initFirst !== user.firstName ||
    initLast !== user.lastName ||
    initRole !== user.role;

  const handleSave = async () => {
    if (!dirty) return;
    try {
      await update.mutateAsync({
        id: user.id,
        payload: { firstName: initFirst, lastName: initLast, role: initRole },
      });
      setFirstName('');
      setLastName('');
      setNewRole('');
    } catch {
      // toast
    }
  };

  const handleReset = async () => {
    if (!window.confirm(`Resetiraj lozinku za ${user.fullName}?`)) return;
    try {
      const result = await resetPassword.mutateAsync(user.id);
      setRevealed({ password: result.temporaryPassword });
      setCopied(false);
    } catch (err) {
      window.alert((err as Error).message);
    }
  };

  const handleToggleActive = async () => {
    if (user.isActive) {
      if (!window.confirm(`Deaktiviraj korisnika ${user.fullName}?`)) return;
      await deactivate.mutateAsync(user.id);
    } else {
      await reactivate.mutateAsync(user.id);
    }
  };

  const handleCopy = async () => {
    if (!revealed) return;
    try {
      await navigator.clipboard.writeText(revealed.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // no-op
    }
  };

  return (
    <div>
      <PageHeader
        title={user.fullName}
        sub={
          <span className="inline-flex items-center gap-2">
            <span>{user.email}</span>
            <Pill color={ROLE_PILL_COLOR[user.role]} dot>
              {ROLE_LABELS_HR[user.role]}
            </Pill>
            {user.isActive ? (
              <Pill color="success" dot>
                Aktivan
              </Pill>
            ) : (
              <Pill color="muted" dot>
                Deaktiviran
              </Pill>
            )}
          </span>
        }
        breadcrumb={
          <>
            <Link to="/korisnici" className="hover:text-text">
              Korisnici
            </Link>{' '}
            / {user.fullName}
          </>
        }
        actions={
          canManage &&
          !isSelf && (
            <>
              <Button
                icon={<RotateCw size={14} />}
                onClick={handleReset}
                loading={resetPassword.isPending}
              >
                Resetiraj lozinku
              </Button>
              <Button
                variant={user.isActive ? 'danger' : 'ghost'}
                icon={user.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                onClick={handleToggleActive}
                loading={deactivate.isPending || reactivate.isPending}
              >
                {user.isActive ? 'Deaktiviraj' : 'Aktiviraj'}
              </Button>
            </>
          )
        }
      />

      <div className="px-8 py-6 grid grid-cols-[1fr_320px] gap-5 max-w-[1100px]">
        <Card padding="lg">
          <SectionTitle
            action={
              canManage && !isSelf && dirty ? (
                <Button
                  size="xs"
                  variant="primary"
                  icon={<Save size={12} />}
                  onClick={handleSave}
                  loading={update.isPending}
                >
                  Spremi
                </Button>
              ) : null
            }
          >
            Podaci korisnika
          </SectionTitle>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Ime">
              <Input
                value={initFirst}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={!canManage || isSelf}
              />
            </Field>
            <Field label="Prezime">
              <Input
                value={initLast}
                onChange={(e) => setLastName(e.target.value)}
                disabled={!canManage || isSelf}
              />
            </Field>
            <Field label="E-mail" cols={2}>
              <Input value={user.email} readOnly />
            </Field>
            <Field label="Uloga" cols={2}>
              <div className="flex gap-2">
                {(['EMPLOYEE', 'ADMIN', 'OWNER'] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    disabled={!canManage || isSelf}
                    onClick={() => setNewRole(r)}
                    className={cn(
                      'flex-1 px-3 py-1.5 text-[13px] rounded-md border transition-colors',
                      initRole === r
                        ? 'bg-accent-soft text-accent border-accent/30'
                        : 'bg-card-hi text-text border-border',
                      (!canManage || isSelf) && 'opacity-60 cursor-not-allowed',
                    )}
                  >
                    {ROLE_LABELS_HR[r]}
                  </button>
                ))}
              </div>
            </Field>
          </div>
          {isSelf && (
            <p className="text-2xs text-muted mt-3 m-0">
              Ne možeš mijenjati vlastite podatke ovdje. Lozinku promijeni u Postavke →
              Sigurnost.
            </p>
          )}
        </Card>

        <Card padding="lg" className="self-start">
          <SectionTitle>Detalji računa</SectionTitle>
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
            <Avatar
              tone={user.role === 'OWNER' ? 'accent' : 'muted'}
              initials={user.initials}
              size={48}
            />
            <div className="min-w-0">
              <div className="font-medium truncate">{user.fullName}</div>
              <div className="text-2xs text-muted truncate">{user.email}</div>
            </div>
          </div>
          <div className="flex flex-col gap-2.5 text-[13px]">
            <div className="flex justify-between gap-3">
              <span className="text-muted">Uloga</span>
              <Pill color={ROLE_PILL_COLOR[user.role]} dot>
                {ROLE_LABELS_HR[user.role]}
              </Pill>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted">Status</span>
              <span className="font-medium">{user.isActive ? 'Aktivan' : 'Deaktiviran'}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted">Lozinka</span>
              <span className="font-medium">
                {user.mustChangePassword ? (
                  <span className="text-warning">Privremena</span>
                ) : (
                  'Aktivna'
                )}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <Modal
        open={revealed !== null}
        onOpenChange={(open) => !open && setRevealed(null)}
        title="Nova privremena lozinka"
        size="md"
        footer={
          <Button variant="primary" onClick={() => setRevealed(null)}>
            Gotovo
          </Button>
        }
      >
        <div className="flex flex-col gap-3">
          <p className="text-2xs text-muted m-0">
            Privremena lozinka za <span className="font-medium text-text">{user.email}</span>{' '}
            generirana je. Pošalji je korisniku — pri sljedećoj prijavi morat će ju
            zamijeniti.
            <br />
            <span className="text-warning">Ovaj prikaz je jednokratan.</span>
          </p>
          <div className="flex items-center gap-2 p-3 bg-card-hi border border-border rounded-md">
            <code className="flex-1 font-mono text-[14px] tracking-wider">
              {revealed?.password}
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
      </Modal>

      {/* Suppress unused navigate import warning while we don't navigate */}
      {false && <span onClick={() => navigate('/')} />}
    </div>
  );
}
