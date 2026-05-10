import { useState } from 'react';
import { Plus, Building2, Edit, Trash2 } from 'lucide-react';
import { PageHeader } from '@/view/common/components/page-header.component';
import { Button } from '@/view/common/components/button.component';
import { Card } from '@/view/common/components/card.component';
import { Spinner } from '@/view/common/components/spinner.component';
import { EmptyState } from '@/view/common/components/empty-state.component';
import { Table } from '@/view/common/components/table.component';
import { Modal } from '@/view/common/components/modal.component';
import { useAuthStore } from '@/view/common/store/auth-store';
import { canEditCatalog, canManageUsers } from '@/domain/common/role';
import { Supplier } from '@/domain/suppliers';
import { useSuppliers, useDeleteSupplier } from './suppliers.hook';
import { SupplierFormModal } from './supplier-form.modal';

export function SuppliersListScreen() {
  const role = useAuthStore((s) => s.user?.role);
  const canEdit = role ? canEditCatalog(role) : false;
  const canDelete = role ? canManageUsers(role) : false;
  const suppliers = useSuppliers();
  const deleteSupplier = useDeleteSupplier();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [deleting, setDeleting] = useState<Supplier | null>(null);

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteSupplier.mutateAsync(deleting.id);
      setDeleting(null);
    } catch {
      // shown in modal
    }
  };

  return (
    <div>
      <PageHeader
        title="Dobavljači"
        sub={suppliers.data ? `${suppliers.data.length} dobavljača` : undefined}
        breadcrumb="Dobavljači"
        actions={
          canEdit && (
            <Button
              variant="primary"
              icon={<Plus size={14} />}
              onClick={() => setCreateOpen(true)}
            >
              Novi dobavljač
            </Button>
          )
        }
      />

      <div className="px-8 py-6">
        {suppliers.isPending ? (
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        ) : suppliers.isError ? (
          <Card padding="lg">
            <div className="text-danger text-2xs">Greška pri dohvaćanju dobavljača.</div>
          </Card>
        ) : suppliers.data.length === 0 ? (
          <EmptyState
            icon={<Building2 size={28} />}
            title="Još nema dobavljača"
            description="Dobavljači su povezani s nabavama i pojedinim artiklima."
            action={
              canEdit && (
                <Button
                  variant="primary"
                  icon={<Plus size={14} />}
                  onClick={() => setCreateOpen(true)}
                >
                  Novi dobavljač
                </Button>
              )
            }
          />
        ) : (
          <Table
            cols={[
              {
                key: 'name',
                label: 'Naziv',
                render: (s) => <span className="font-medium">{s.name}</span>,
              },
              {
                key: 'contact',
                label: 'Kontakt osoba',
                muted: true,
                render: (s) => s.contactPerson ?? '—',
              },
              {
                key: 'phone',
                label: 'Telefon',
                muted: true,
                render: (s) => s.phone ?? '—',
                width: '140px',
              },
              {
                key: 'email',
                label: 'E-mail',
                muted: true,
                render: (s) => s.email ?? '—',
                width: '220px',
              },
              {
                key: 'actions',
                label: '',
                width: '110px',
                align: 'right',
                render: (s) =>
                  canEdit ? (
                    <div className="inline-flex gap-1 justify-end">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditing(s);
                        }}
                        className="p-1.5 text-muted hover:text-text rounded-md"
                        aria-label="Uredi"
                      >
                        <Edit size={14} />
                      </button>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleting(s);
                          }}
                          className="p-1.5 text-muted hover:text-danger rounded-md"
                          aria-label="Obriši"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ) : null,
              },
            ]}
            rows={suppliers.data}
            rowKey={(s) => s.id}
          />
        )}
      </div>

      <SupplierFormModal open={createOpen} onOpenChange={setCreateOpen} />
      <SupplierFormModal
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        initial={editing}
      />
      <Modal
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Obriši dobavljača "${deleting?.name ?? ''}"?`}
        description="Ako postoje povezane nabave ili artikli, brisanje se može odbiti."
        size="sm"
        footer={
          <>
            <Button onClick={() => setDeleting(null)} disabled={deleteSupplier.isPending}>
              Odustani
            </Button>
            <Button
              variant="primary"
              onClick={handleDelete}
              loading={deleteSupplier.isPending}
              className="!bg-danger !border-danger"
            >
              Obriši
            </Button>
          </>
        }
      >
        {deleteSupplier.error && (
          <div className="text-2xs text-danger">{(deleteSupplier.error as Error).message}</div>
        )}
      </Modal>
    </div>
  );
}
