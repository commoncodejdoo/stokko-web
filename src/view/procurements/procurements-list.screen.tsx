import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Truck } from 'lucide-react';
import { PageHeader } from '@/view/common/components/page-header.component';
import { Button } from '@/view/common/components/button.component';
import { Card } from '@/view/common/components/card.component';
import { Spinner } from '@/view/common/components/spinner.component';
import { EmptyState } from '@/view/common/components/empty-state.component';
import { Table } from '@/view/common/components/table.component';
import { Stat } from '@/view/common/components/stat.component';
import { useProcurements } from './procurements.hook';
import { useWarehouses } from '@/view/warehouses/warehouses.hook';
import { useSuppliers } from '@/view/suppliers/suppliers.hook';
import { fmtMoney } from '@/view/common/utils/format';
import { cn } from '@/view/common/utils/cn';

type RangeFilter = 'all' | 'today' | 'week';

function rangeSinceIso(range: RangeFilter): string | undefined {
  const now = new Date();
  if (range === 'today') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return start.toISOString();
  }
  if (range === 'week') {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return d.toISOString();
  }
  return undefined;
}

export function ProcurementsListScreen() {
  const navigate = useNavigate();
  const [range, setRange] = useState<RangeFilter>('all');

  const procurements = useProcurements({
    createdSince: rangeSinceIso(range),
    pageSize: 50,
  });
  const warehouses = useWarehouses();
  const suppliers = useSuppliers();

  const warehouseName = (id: string) =>
    warehouses.data?.find((w) => w.id === id)?.name ?? id;
  const supplierName = (id: string | null) =>
    id ? suppliers.data?.find((s) => s.id === id)?.name ?? id : 'Bez dobavljača';

  const items = procurements.data?.items ?? [];

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    let todayCount = 0;
    let weekCount = 0;
    let monthCount = 0;
    let monthValue = 0;
    let currency = 'EUR';
    items.forEach((p) => {
      const d = new Date(p.createdAt);
      if (d >= today) todayCount++;
      if (d >= weekAgo) weekCount++;
      if (d >= monthAgo) {
        monthCount++;
        monthValue += Number(p.totalValue) || 0;
        currency = p.currency;
      }
    });
    return { todayCount, weekCount, monthCount, monthValue, currency };
  }, [items]);

  return (
    <div>
      <PageHeader
        title="Nabave"
        sub={procurements.data ? `${procurements.data.pagination.total} ukupno` : undefined}
        breadcrumb="Nabave"
        actions={
          <Button
            variant="primary"
            icon={<Plus size={14} />}
            onClick={() => navigate('/primke/nova')}
          >
            Nova nabava
          </Button>
        }
      />

      <div className="px-8 py-6 flex flex-col gap-5">
        <div className="grid grid-cols-4 gap-4">
          <Stat label="Danas" value={String(stats.todayCount)} color="var(--accent)" />
          <Stat label="Zadnjih 7 dana" value={String(stats.weekCount)} color="var(--success)" />
          <Stat label="Zadnjih 30 dana" value={String(stats.monthCount)} color="var(--accent)" />
          <Stat
            label="Vrijednost (30 dana)"
            value={fmtMoney(stats.monthValue, stats.currency)}
            color="var(--accent)"
          />
        </div>

        <div className="flex gap-2 items-center">
          <div className="flex gap-1 p-0.5 bg-card-hi border border-border rounded-md">
            {(
              [
                ['all', 'Sve'],
                ['week', 'Tjedan'],
                ['today', 'Danas'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setRange(key)}
                className={cn(
                  'px-3 py-1 text-2xs rounded-sm whitespace-nowrap transition-colors',
                  range === key
                    ? 'bg-card text-text font-medium'
                    : 'text-muted hover:text-text',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {procurements.isPending ? (
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        ) : procurements.isError ? (
          <Card padding="lg">
            <div className="text-danger text-2xs">Greška pri dohvaćanju nabava.</div>
          </Card>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Truck size={28} />}
            title={range === 'all' ? 'Još nema nabava.' : 'Nema nabava u odabranom razdoblju.'}
            description="Evidentiraj prvu nabavu kako bi pratio dolazak robe na skladišta."
            action={
              <Button
                variant="primary"
                icon={<Plus size={14} />}
                onClick={() => navigate('/primke/nova')}
              >
                Nova nabava
              </Button>
            }
          />
        ) : (
          <Table
            cols={[
              {
                key: 'code',
                label: 'Šifra',
                width: '170px',
                render: (p) => (
                  <span className="font-mono text-2xs font-medium">
                    {p.id.slice(0, 8).toUpperCase()}
                  </span>
                ),
              },
              {
                key: 'date',
                label: 'Datum',
                width: '130px',
                muted: true,
                render: (p) =>
                  new Date(p.createdAt).toLocaleDateString('hr-HR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  }),
              },
              {
                key: 'supplier',
                label: 'Dobavljač',
                render: (p) => (
                  <span className={p.supplierId ? 'font-medium' : 'text-muted italic'}>
                    {supplierName(p.supplierId)}
                  </span>
                ),
              },
              {
                key: 'warehouse',
                label: 'Skladište',
                render: (p) => warehouseName(p.warehouseId),
              },
              {
                key: 'items',
                label: 'Stavki',
                width: '90px',
                align: 'right',
                muted: true,
                render: (p) => p.items.length,
              },
              {
                key: 'total',
                label: 'Iznos',
                width: '160px',
                align: 'right',
                render: (p) => (
                  <span className="font-medium">{fmtMoney(p.totalValue, p.currency)}</span>
                ),
              },
            ]}
            rows={items}
            rowKey={(p) => p.id}
            onRowClick={(p) => navigate(`/primke/${p.id}`)}
          />
        )}
      </div>
    </div>
  );
}
