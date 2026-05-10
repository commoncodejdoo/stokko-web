import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Edit, Trash2 } from 'lucide-react';
import { PageHeader } from '@/view/common/components/page-header.component';
import { Button } from '@/view/common/components/button.component';
import { Card } from '@/view/common/components/card.component';
import { Stat } from '@/view/common/components/stat.component';
import { SectionTitle } from '@/view/common/components/section-title.component';
import { Spinner } from '@/view/common/components/spinner.component';
import { Pill } from '@/view/common/components/pill.component';
import { Table } from '@/view/common/components/table.component';
import { Modal } from '@/view/common/components/modal.component';
import { useAuthStore } from '@/view/common/store/auth-store';
import { canEditCatalog, canManageUsers } from '@/domain/common/role';
import { fmtMoney } from '@/view/common/utils/format';
import { formatQuantity, UNIT_LABELS_HR } from '@/domain/common/unit';
import { STOCK_STATUS_LABELS_HR } from '@/domain/common/stock-status';
import { useArticle, useDeleteArticle } from './articles.hook';
import { useCategories } from '@/view/categories/categories.hook';
import { useSuppliers } from '@/view/suppliers/suppliers.hook';
import { useWarehouses } from '@/view/warehouses/warehouses.hook';
import { ArticleFormModal } from './article-form.modal';

const STATUS_COLOR = {
  OK: 'success',
  WARNING: 'warning',
  CRITICAL: 'danger',
  UNKNOWN: 'muted',
} as const;

export function ArticleDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user?.role);
  const article = useArticle(id);
  const categories = useCategories();
  const suppliers = useSuppliers();
  const warehouses = useWarehouses();
  const deleteArticle = useDeleteArticle();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const canEdit = role ? canEditCatalog(role) : false;
  const canDelete = role ? canManageUsers(role) : false;

  if (article.isPending) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }
  if (article.isError || !article.data) {
    return (
      <div className="px-8 py-6">
        <Card padding="lg">
          <div className="text-danger text-2xs">Artikl nije pronađen.</div>
        </Card>
      </div>
    );
  }

  const a = article.data;
  const category = categories.data?.find((c) => c.id === a.categoryId);
  const supplier = a.supplierId ? suppliers.data?.find((s) => s.id === a.supplierId) : null;

  const handleDelete = async () => {
    try {
      await deleteArticle.mutateAsync(a.id);
      navigate('/artikli', { replace: true });
    } catch {
      // error shown in modal
    }
  };

  return (
    <div>
      <PageHeader
        title={a.name}
        sub={
          <span className="inline-flex items-center gap-2">
            <span className="font-mono">{a.sku}</span>
            {category && <Pill>{category.name}</Pill>}
            <Pill color={STATUS_COLOR[a.status]} dot>
              {STOCK_STATUS_LABELS_HR[a.status]}
            </Pill>
          </span>
        }
        breadcrumb={
          <>
            <Link to="/artikli" className="hover:text-text">
              Artikli
            </Link>{' '}
            / {a.sku}
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

      <div className="px-8 py-6 grid grid-cols-[2fr_1fr] gap-5">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4">
            <Stat
              label="Ukupno stanje"
              value={`${formatQuantity(a.totalQuantity, a.unit)} ${UNIT_LABELS_HR[a.unit]}`}
              color={a.status === 'OK' ? 'var(--success)' : 'var(--warning)'}
            />
            <Stat
              label="Prag upozorenja"
              value={`${formatQuantity(a.thresholdWarning, a.unit)} ${UNIT_LABELS_HR[a.unit]}`}
              color="var(--muted)"
            />
            <Stat
              label="Vrijednost zaliha"
              value={fmtMoney(Number(a.totalQuantity) * Number(a.purchasePrice), a.currency)}
              color="var(--accent)"
            />
          </div>

          <div>
            <SectionTitle>Stanje po skladištima</SectionTitle>
            <Table
              cols={[
                {
                  key: 'wh',
                  label: 'Skladište',
                  render: (s) => {
                    const w = warehouses.data?.find((x) => x.id === s.warehouseId);
                    return w ? (
                      <div className="inline-flex items-center gap-2">
                        <span
                          style={{ background: w.color }}
                          className="size-2.5 rounded-full"
                        />
                        <span className="font-medium">{w.name}</span>
                      </div>
                    ) : (
                      s.warehouseId
                    );
                  },
                },
                {
                  key: 'qty',
                  label: 'Količina',
                  width: '160px',
                  align: 'right',
                  render: (s) =>
                    `${formatQuantity(s.quantity, a.unit)} ${UNIT_LABELS_HR[a.unit]}`,
                },
                {
                  key: 'status',
                  label: 'Status',
                  width: '140px',
                  render: (s) => (
                    <Pill color={STATUS_COLOR[s.status]} dot>
                      {STOCK_STATUS_LABELS_HR[s.status]}
                    </Pill>
                  ),
                },
              ]}
              rows={a.stockByWarehouse ?? []}
              rowKey={(s) => s.warehouseId}
              emptyMessage="Artikl još nije na nijednom skladištu."
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Card padding="lg">
            <SectionTitle>Detalji</SectionTitle>
            <div className="flex flex-col gap-2.5 text-[13px]">
              {[
                ['SKU', <span className="font-mono">{a.sku}</span>],
                ['Kategorija', category?.name ?? '—'],
                ['Mjerna jedinica', UNIT_LABELS_HR[a.unit]],
                ['Nabavna cijena', fmtMoney(a.purchasePrice, a.currency)],
                ['Prodajna cijena', fmtMoney(a.salePrice, a.currency)],
                ['Dobavljač', supplier?.name ?? '—'],
                [
                  'Pragovi',
                  `${formatQuantity(a.thresholdWarning, a.unit)} / ${formatQuantity(
                    a.thresholdCritical,
                    a.unit,
                  )}`,
                ],
              ].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between gap-3">
                  <span className="text-muted">{k}</span>
                  <span className="font-medium text-right">{v}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <ArticleFormModal open={editOpen} onOpenChange={setEditOpen} initial={a} />

      <Modal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Obriši artikl "${a.name}"?`}
        description="Artikl se može obrisati samo ako nema zaliha ni na jednom skladištu."
        size="sm"
        footer={
          <>
            <Button onClick={() => setDeleteOpen(false)} disabled={deleteArticle.isPending}>
              Odustani
            </Button>
            <Button
              variant="primary"
              onClick={handleDelete}
              loading={deleteArticle.isPending}
              className="!bg-danger !border-danger"
            >
              Obriši
            </Button>
          </>
        }
      >
        {deleteArticle.error && (
          <div className="text-2xs text-danger">{(deleteArticle.error as Error).message}</div>
        )}
      </Modal>
    </div>
  );
}
