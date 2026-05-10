import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, RotateCw, UserX, UserCheck, Copy, Check } from 'lucide-react';
import { PageHeader } from '@/view/common/components/page-header.component';
import { Button } from '@/view/common/components/button.component';
import { Card } from '@/view/common/components/card.component';
import { Spinner } from '@/view/common/components/spinner.component';
import { EmptyState } from '@/view/common/components/empty-state.component';
import { Table } from '@/view/common/components/table.component';
import { Pill } from '@/view/common/components/pill.component';
import { Avatar } from '@/view/common/components/avatar.component';
import { Modal } from '@/view/common/components/modal.component';
import { useAuthStore } from '@/view/common/store/auth-store';
import { canManageUsers, ROLE_LABELS_HR } from '@/domain/common/role';
import { User } from '@/domain/users';
import {
  useUsers,
  useDeactivateUser,
  useReactivateUser,
  useResetUserPassword,
} from './users.hook';
import { UserInviteModal } from './user-invite.modal';

const ROLE_PILL_COLOR = {
  OWNER: 'accent',
  ADMIN: 'success',
  EMPLOYEE: 'muted',
} as const;

export function UsersListScreen() {
  const navigate = useNavigate();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const role = useAuthStore((s) => s.user?.role);
  const canManage = role ? canManageUsers(role) : false;
  const users = useUsers();
  const deactivate = useDeactivateUser();
  const reactivate = useReactivateUser();
  const resetPassword = useResetUserPassword();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [revealed, setRevealed] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleReset = async (u: User) => {
    if (!window.confirm(`Resetiraj lozinku za ${u.fullName}?`)) return;
    try {
      const result = await resetPassword.mutateAsync(u.id);
      setRevealed({ email: u.email, password: result.temporaryPassword });
      setCopied(false);
    } catch (err) {
      window.alert((err as Error).message);
    }
  };

  const handleToggleActive = async (u: User) => {
    if (u.isActive) {
      if (!window.confirm(`Deaktiviraj korisnika ${u.fullName}?`)) return;
      await deactivate.mutateAsync(u.id);
    } else {
      await reactivate.mutateAsync(u.id);
    }
  };

  const handleCopyReveal = async () => {
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
        title="Korisnici"
        sub={users.data ? `${users.data.length} članova tima` : undefined}
        breadcrumb="Korisnici"
        actions={
          canManage && (
            <Button
              variant="primary"
              icon={<Plus size={14} />}
              onClick={() => setInviteOpen(true)}
            >
              Pozovi korisnika
            </Button>
          )
        }
      />

      <div className="px-8 py-6">
        {users.isPending ? (
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        ) : users.isError ? (
          <Card padding="lg">
            <div className="text-danger text-2xs">Greška pri dohvaćanju korisnika.</div>
          </Card>
        ) : users.data.length === 0 ? (
          <EmptyState
            icon={<Users size={28} />}
            title="Još nema korisnika"
            description="Pozovi prve članove tima kako bi mogli pristupiti aplikaciji."
            action={
              canManage && (
                <Button
                  variant="primary"
                  icon={<Plus size={14} />}
                  onClick={() => setInviteOpen(true)}
                >
                  Pozovi korisnika
                </Button>
              )
            }
          />
        ) : (
          <Table
            cols={[
              {
                key: 'user',
                label: 'Korisnik',
                render: (u) => (
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      tone={u.role === 'OWNER' ? 'accent' : 'muted'}
                      initials={u.initials}
                    />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{u.fullName}</div>
                      <div className="text-2xs text-muted truncate">{u.email}</div>
                    </div>
                  </div>
                ),
              },
              {
                key: 'role',
                label: 'Uloga',
                width: '140px',
                render: (u) => (
                  <Pill color={ROLE_PILL_COLOR[u.role]} dot>
                    {ROLE_LABELS_HR[u.role]}
                  </Pill>
                ),
              },
              {
                key: 'status',
                label: 'Status',
                width: '130px',
                render: (u) =>
                  u.isActive ? (
                    <Pill color="success" dot>
                      Aktivan
                    </Pill>
                  ) : (
                    <Pill color="muted" dot>
                      Deaktiviran
                    </Pill>
                  ),
              },
              {
                key: 'mustChange',
                label: 'Lozinka',
                width: '140px',
                muted: true,
                render: (u) =>
                  u.mustChangePassword ? (
                    <span className="text-warning">Privremena</span>
                  ) : (
                    'Aktivna'
                  ),
              },
              {
                key: 'actions',
                label: '',
                width: '120px',
                align: 'right',
                render: (u) =>
                  canManage && u.id !== currentUserId ? (
                    <div className="inline-flex gap-1 justify-end">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReset(u);
                        }}
                        className="p-1.5 text-muted hover:text-text rounded-md"
                        aria-label="Resetiraj lozinku"
                        title="Resetiraj lozinku"
                      >
                        <RotateCw size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(u);
                        }}
                        className="p-1.5 text-muted hover:text-text rounded-md"
                        aria-label={u.isActive ? 'Deaktiviraj' : 'Aktiviraj'}
                        title={u.isActive ? 'Deaktiviraj' : 'Aktiviraj'}
                      >
                        {u.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                      </button>
                    </div>
                  ) : null,
              },
            ]}
            rows={users.data}
            rowKey={(u) => u.id}
            onRowClick={(u) => navigate(`/korisnici/${u.id}`)}
          />
        )}
      </div>

      <UserInviteModal open={inviteOpen} onOpenChange={setInviteOpen} />

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
            Privremena lozinka za <span className="font-medium text-text">{revealed?.email}</span>{' '}
            generirana je. Pošalji je korisniku — pri prvoj prijavi morat će ju zamijeniti.
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
              onClick={handleCopyReveal}
            >
              {copied ? 'Kopirano' : 'Kopiraj'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
