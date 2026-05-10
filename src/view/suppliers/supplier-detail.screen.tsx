import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Edit, Trash2, Building2 } from 'lucide-react';
import { PageHeader } from '@/view/common/components/page-header.component';
import { Button } from '@/view/common/components/button.component';
import { Card } from '@/view/common/components/card.component';
import { SectionTitle } from '@/view/common/components/section-title.component';
import { Spinner } from '@/view/common/components/spinner.component';
import { Pill } from '@/view/common/components/pill.component';
import { Table } from '@/view/common/components/table.component';
import { Modal } from '@/view/common/components/modal.component';
import { useAuthStore } from '@/view/common/store/auth-store';
import { canEditCatalog, canManageUsers } from '@/domain/common/role';
import { fmtMoney } from '@/view/common/utils/format';
import { formatQuantity, UNIT_LABELS_HR } from '@/domain/common/unit';
import { useSupplier, useDeleteSupplier } from './suppliers.hook';
import { useArticles } from '@/view/articles/articles.hook';
import { useCategories } from '@/view/categories/categories.hook';
import { SupplierFormModal } from './supplier-form.modal';

export function SupplierDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user?.role);
  const canEdit = role ? canEditCatalog(role) : false;
  const canDelete = role ? canManageUsers(role) : false;

  const supplier = useSupplier(id);
  const articles = useArticles({ supplierId: id });
  const categories = useCategories();
  const deleteSupplier = useDeleteSupplier();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (supplier.isPending) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }
  if (supplier.isError || !supplier.data) {
    return (
      <div className="px-8 py-6">
        <Card padding="lg">
          <div className="text-danger text-2xs">Dobavljač nije pronađen.</div>
        </Card>
      </div>
    );
  }
  const s = supplier.data;

  const handleDelete = async () => {
    try {
      await deleteSupplier.mutateAsync(s.id);
      navigate('/suppliers', { replace: true });
    } catch {
      // toast
    }
  };

  return (
    <div>
      <PageHeader
        title={s.name}
        sub={
          <span className="inline-flex items-center gap-2">
            <Building2 size={14} className="text-muted" />
            <span>Dobavljač</span>
          </span>
        }
        breadcrumb={
          <>
            <Link to="/suppliers" className="hover:text-text">
              Dobavljači
            </Link>{' '}
            / {s.name}
          </>
        }
        actions={
          canEdit && (
            <>
              <Button icon={<Edit size={14} />} onClick={() => setEditOpen(true)}>
                Uredi
              </Button>
              {canDelete && (
                <Button
                  variant="danger"
                  icon={<Trash2 size={14} />}
                  onClick={() => setDeleteOpen(true)}
                >
                  Obriši
                </Button>
              )}
            </>
          )
        }
      />

      <div className="px-8 py-6 grid grid-cols-[1fr_320px] gap-5">
        <div>
          <SectionTitle>
            Artikli s dobavljačem ({articles.data?.length ?? 0})
          </SectionTitle>
          {articles.isPending ? (
            <div className="flex items-center justify-center py-10">
              <Spinner />
            </div>
          ) : articles.data && articles.data.length > 0 ? (
            <Table
              cols={[
                {
                  key: 'sku',
                  label: 'SKU',
                  width: '120px',
                  render: (a) => (
                    <span className="font-mono text-2xs text-muted">{a.sku}</span>
                  ),
                },
                {
                  key: 'name',
                  label: 'Naziv',
                  render: (a) => <span className="font-medium">{a.name}</span>,
                },
                {
                  key: 'cat',
                  label: 'Kategorija',
                  width: '140px',
                  render: (a) => {
                    const c = categories.data?.find((x) => x.id === a.categoryId);
                    return c ? <Pill>{c.name}</Pill> : '—';
                  },
                },
                {
                  key: 'qty',
                  label: 'Ukupno stanje',
                  width: '160px',
                  align: 'right',
                  render: (a) =>
                    `${formatQuantity(a.totalQuantity, a.unit)} ${UNIT_LABELS_HR[a.unit]}`,
                },
                {
                  key: 'price',
                  label: 'Nab. cijena',
                  width: '130px',
                  align: 'right',
                  render: (a) => fmtMoney(a.purchasePrice, a.currency),
                },
              ]}
              rows={articles.data}
              rowKey={(a) => a.id}
              onRowClick={(a) => navigate(`/articles/${a.id}`)}
            />
          ) : (
            <Card padding="lg">
              <p className="text-2xs text-muted m-0 text-center py-4">
                Ovaj dobavljač trenutno nije povezan ni s jednim artiklom.
              </p>
            </Card>
          )}
        </div>

        <Card padding="lg" className="self-start">
          <SectionTitle>Kontakt</SectionTitle>
          <div className="flex flex-col gap-2.5 text-[13px]">
            {[
              ['Naziv', s.name],
              ['Kontakt osoba', s.contactPerson ?? '—'],
              ['Telefon', s.phone ?? '—'],
              ['E-mail', s.email ?? '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <span className="text-muted">{k}</span>
                <span className="font-medium text-right">{v}</span>
              </div>
            ))}
          </div>
          {s.note && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="text-2xs text-muted mb-1">Napomena</div>
              <div className="text-[13px]">{s.note}</div>
            </div>
          )}
        </Card>
      </div>

      <SupplierFormModal open={editOpen} onOpenChange={setEditOpen} initial={s} />

      <Modal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Obriši dobavljača "${s.name}"?`}
        description="Ako postoje povezani artikli ili nabave, brisanje se može odbiti."
        size="sm"
        footer={
          <>
            <Button onClick={() => setDeleteOpen(false)} disabled={deleteSupplier.isPending}>
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
