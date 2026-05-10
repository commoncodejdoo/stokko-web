import { useMemo, useState } from 'react';
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
import { fmtMoney, fmtNumber } from '@/view/common/utils/format';
import { formatQuantity, UNIT_LABELS_HR } from '@/domain/common/unit';
import { STOCK_STATUS_LABELS_HR } from '@/domain/common/stock-status';
import {
  useWarehouse,
  useWarehouseArticles,
  useDeleteWarehouse,
} from './warehouses.hook';
import { WarehouseFormModal } from './warehouse-form.modal';

const STATUS_COLOR = {
  OK: 'success',
  WARNING: 'warning',
  CRITICAL: 'danger',
  UNKNOWN: 'muted',
} as const;

export function WarehouseDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user?.role);
  const warehouse = useWarehouse(id);
  const articles = useWarehouseArticles(id);
  const deleteWarehouse = useDeleteWarehouse();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const canEdit = role ? canEditCatalog(role) : false;
  const canDelete = role ? canManageUsers(role) : false;

  const summary = articles.data?.summary;
  const lowCount = useMemo(
    () =>
      articles.data?.items.filter((a) => a.status === 'WARNING' || a.status === 'CRITICAL')
        .length ?? 0,
    [articles.data],
  );

  if (warehouse.isPending) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }
  if (warehouse.isError || !warehouse.data) {
    return (
      <div className="px-8 py-6">
        <Card padding="lg">
          <div className="text-danger text-2xs">Skladište nije pronađeno.</div>
        </Card>
      </div>
    );
  }
  const w = warehouse.data;

  const handleDelete = async () => {
    try {
      await deleteWarehouse.mutateAsync(w.id);
      navigate('/warehouses', { replace: true });
    } catch {
      // error shown in modal
    }
  };

  return (
    <div>
      <PageHeader
        title={w.name}
        sub={summary ? `${summary.articleCount} artikala` : undefined}
        breadcrumb={
          <>
            <Link to="/warehouses" className="hover:text-text">
              Skladišta
            </Link>{' '}
            / {w.name}
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

      <div className="px-8 py-6 flex flex-col gap-5">
        <div className="grid grid-cols-4 gap-4">
          <Stat label="Artikli" value={summary ? fmtNumber(summary.articleCount) : '—'} />
          <Stat
            label="Vrijednost zaliha"
            value={summary ? fmtMoney(summary.totalValue, summary.currency) : '—'}
            color="var(--accent)"
          />
          <Stat label="Niska zaliha" value={fmtNumber(lowCount)} color="var(--warning)" />
          <Stat label="Tip" value={w.kind === 'FOH' ? 'FOH' : 'BOH'} color="var(--muted)" />
        </div>

        <div>
          <SectionTitle>Artikli u skladištu</SectionTitle>
          {articles.isPending ? (
            <div className="flex items-center justify-center py-10">
              <Spinner />
            </div>
          ) : (
            <Table
              cols={[
                {
                  key: 'sku',
                  label: 'SKU',
                  width: '120px',
                  render: (a) => <span className="font-mono text-2xs text-muted">{a.sku}</span>,
                },
                {
                  key: 'name',
                  label: 'Naziv',
                  render: (a) => <span className="font-medium">{a.name}</span>,
                },
                {
                  key: 'qty',
                  label: 'Količina',
                  width: '160px',
                  align: 'right',
                  render: (a) =>
                    `${formatQuantity(a.quantity, a.unit)} ${UNIT_LABELS_HR[a.unit]}`,
                },
                {
                  key: 'status',
                  label: 'Status',
                  width: '140px',
                  render: (a) => (
                    <Pill color={STATUS_COLOR[a.status]} dot>
                      {STOCK_STATUS_LABELS_HR[a.status]}
                    </Pill>
                  ),
                },
                {
                  key: 'price',
                  label: 'Nab. cijena',
                  width: '140px',
                  align: 'right',
                  render: (a) => fmtMoney(a.purchasePrice, a.currency),
                },
              ]}
              rows={articles.data?.items ?? []}
              rowKey={(a) => a.articleId}
              onRowClick={(a) => navigate(`/articles/${a.articleId}`)}
              emptyMessage="Skladište ne sadrži artikle."
            />
          )}
        </div>
      </div>

      <WarehouseFormModal open={editOpen} onOpenChange={setEditOpen} initial={w} />

      <Modal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Obriši skladište "${w.name}"?`}
        description="Ova akcija je nepovratna. Skladište mora biti prazno prije brisanja."
        size="sm"
        footer={
          <>
            <Button onClick={() => setDeleteOpen(false)} disabled={deleteWarehouse.isPending}>
              Odustani
            </Button>
            <Button
              variant="primary"
              onClick={handleDelete}
              loading={deleteWarehouse.isPending}
              className="!bg-danger !border-danger"
            >
              Obriši
            </Button>
          </>
        }
      >
        {deleteWarehouse.error && (
          <div className="text-2xs text-danger">
            {(deleteWarehouse.error as Error).message}
          </div>
        )}
      </Modal>
    </div>
  );
}
