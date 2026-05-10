import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
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
import { canManageUsers } from '@/domain/common/role';
import { SHIFT_STATUS_LABELS_HR } from '@/domain/sales';
import { fmtMoney, fmtNumber } from '@/view/common/utils/format';
import { formatQuantity, UNIT_LABELS_HR } from '@/domain/common/unit';
import { useShift, useDeleteShift } from './shifts.hook';
import { useWarehouses } from '@/view/warehouses/warehouses.hook';
import { useArticles } from '@/view/articles/articles.hook';

export function ShiftDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user?.role);
  const canDelete = role ? canManageUsers(role) : false;

  const shift = useShift(id);
  const warehouses = useWarehouses();
  const articles = useArticles();
  const deleteShift = useDeleteShift();

  const [deleteOpen, setDeleteOpen] = useState(false);

  if (shift.isPending) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }
  if (shift.isError || !shift.data) {
    return (
      <div className="px-8 py-6">
        <Card padding="lg">
          <div className="text-danger text-2xs">Smjena nije pronađena.</div>
        </Card>
      </div>
    );
  }

  const { shift: s, sales } = shift.data;
  const articlesById = new Map(articles.data?.map((a) => [a.id, a]) ?? []);
  const whById = new Map(warehouses.data?.map((w) => [w.id, w]) ?? []);

  const handleDelete = async () => {
    try {
      await deleteShift.mutateAsync(s.id);
      navigate('/smjena', { replace: true });
    } catch {
      // toast
    }
  };

  return (
    <div>
      <PageHeader
        title={`Smjena ${new Date(s.date).toLocaleDateString('hr-HR')}`}
        sub={
          <span className="inline-flex items-center gap-2">
            <Pill color={s.status === 'CLOSED' ? 'success' : 'warning'} dot>
              {SHIFT_STATUS_LABELS_HR[s.status]}
            </Pill>
            <span>
              Otvoreno{' '}
              {new Date(s.openedAt).toLocaleTimeString('hr-HR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {s.closedAt && (
              <span>
                · Zatvoreno{' '}
                {new Date(s.closedAt).toLocaleTimeString('hr-HR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </span>
        }
        breadcrumb={
          <>
            <Link to="/smjena" className="hover:text-text">
              Smjene
            </Link>{' '}
            / {new Date(s.date).toLocaleDateString('hr-HR')}
          </>
        }
        actions={
          canDelete && (
            <Button
              variant="danger"
              icon={<Trash2 size={14} />}
              onClick={() => setDeleteOpen(true)}
            >
              Obriši
            </Button>
          )
        }
      />

      <div className="px-8 py-6 flex flex-col gap-5">
        <div className="grid grid-cols-3 gap-4">
          <Stat
            label="Ukupna količina"
            value={fmtNumber(s.totalQuantity)}
            color="var(--accent)"
          />
          <Stat
            label="Promet"
            value={fmtMoney(s.totalRevenue, s.currency)}
            color="var(--success)"
          />
          <Stat label="Broj prodaja" value={fmtNumber(sales.length)} color="var(--muted)" />
        </div>

        {sales.map((sale) => {
          const wh = whById.get(sale.warehouseId);
          return (
            <div key={sale.id}>
              <SectionTitle
                action={
                  <span className="text-2xs text-muted">
                    {fmtMoney(sale.totalRevenue, sale.currency)}
                  </span>
                }
              >
                <span className="inline-flex items-center gap-2 normal-case tracking-normal">
                  {wh && (
                    <span
                      style={{ background: wh.color }}
                      className="size-2.5 rounded-full"
                    />
                  )}
                  <span className="text-muted">{wh?.name ?? sale.warehouseId}</span>
                  <span className="text-faint">·</span>
                  <span className="text-muted text-[11px]">
                    {sale.items.length} {sale.items.length === 1 ? 'stavka' : 'stavki'}
                  </span>
                </span>
              </SectionTitle>
              <Table
                cols={[
                  {
                    key: 'sku',
                    label: 'SKU',
                    width: '120px',
                    render: (i) => (
                      <span className="font-mono text-2xs text-muted">
                        {articlesById.get(i.articleId)?.sku ?? '—'}
                      </span>
                    ),
                  },
                  {
                    key: 'name',
                    label: 'Artikl',
                    render: (i) => (
                      <span className="font-medium">
                        {articlesById.get(i.articleId)?.name ?? i.articleId}
                      </span>
                    ),
                  },
                  {
                    key: 'qty',
                    label: 'Količina',
                    width: '140px',
                    align: 'right',
                    render: (i) => {
                      const a = articlesById.get(i.articleId);
                      return a
                        ? `${formatQuantity(i.quantity, a.unit)} ${UNIT_LABELS_HR[a.unit]}`
                        : i.quantity;
                    },
                  },
                  {
                    key: 'price',
                    label: 'Cijena',
                    width: '130px',
                    align: 'right',
                    render: (i) => fmtMoney(i.unitPrice, sale.currency),
                  },
                  {
                    key: 'total',
                    label: 'Ukupno',
                    width: '140px',
                    align: 'right',
                    render: (i) => (
                      <span className="font-medium">
                        {fmtMoney(i.lineTotal, sale.currency)}
                      </span>
                    ),
                  },
                ]}
                rows={sale.items}
                rowKey={(i) => i.id}
              />
            </div>
          );
        })}
      </div>

      <Modal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Obriši smjenu?"
        description="Brisanjem se uklanjaju svi računi i vraćaju zalihe na stanje prije obračuna."
        size="sm"
        footer={
          <>
            <Button onClick={() => setDeleteOpen(false)} disabled={deleteShift.isPending}>
              Odustani
            </Button>
            <Button
              variant="primary"
              onClick={handleDelete}
              loading={deleteShift.isPending}
              className="!bg-danger !border-danger"
            >
              Obriši
            </Button>
          </>
        }
      >
        {deleteShift.error && (
          <div className="text-2xs text-danger">{(deleteShift.error as Error).message}</div>
        )}
      </Modal>
    </div>
  );
}
