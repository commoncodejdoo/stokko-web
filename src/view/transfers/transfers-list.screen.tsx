import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeftRight } from 'lucide-react';
import { PageHeader } from '@/view/common/components/page-header.component';
import { Button } from '@/view/common/components/button.component';
import { Card } from '@/view/common/components/card.component';
import { Spinner } from '@/view/common/components/spinner.component';
import { EmptyState } from '@/view/common/components/empty-state.component';
import { Table } from '@/view/common/components/table.component';
import { useTransfers } from './transfers.hook';
import { useWarehouses } from '@/view/warehouses/warehouses.hook';

export function TransfersListScreen() {
  const navigate = useNavigate();
  const transfers = useTransfers({ pageSize: 50 });
  const warehouses = useWarehouses();

  const whName = (id: string) => warehouses.data?.find((w) => w.id === id)?.name ?? id;
  const whColor = (id: string) => warehouses.data?.find((w) => w.id === id)?.color ?? '#888';

  return (
    <div>
      <PageHeader
        title="Premještaji robe"
        sub={transfers.data ? `${transfers.data.pagination.total} ukupno` : undefined}
        breadcrumb="Premještaji"
        actions={
          <Button
            variant="primary"
            icon={<Plus size={14} />}
            onClick={() => navigate('/premjestaj/novi')}
          >
            Novi premještaj
          </Button>
        }
      />
      <div className="px-8 py-6">
        {transfers.isPending ? (
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        ) : transfers.isError ? (
          <Card padding="lg">
            <div className="text-danger text-2xs">Greška pri dohvaćanju premještaja.</div>
          </Card>
        ) : transfers.data.items.length === 0 ? (
          <EmptyState
            icon={<ArrowLeftRight size={28} />}
            title="Još nema premještaja"
            description="Premjesti robu između skladišta — npr. iz back-of-house u bar."
            action={
              <Button
                variant="primary"
                icon={<Plus size={14} />}
                onClick={() => navigate('/premjestaj/novi')}
              >
                Novi premještaj
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
                render: (t) => (
                  <span className="font-mono text-2xs font-medium">
                    {t.id.slice(0, 8).toUpperCase()}
                  </span>
                ),
              },
              {
                key: 'date',
                label: 'Datum',
                width: '160px',
                muted: true,
                render: (t) =>
                  new Date(t.createdAt).toLocaleString('hr-HR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
              },
              {
                key: 'route',
                label: 'Premještaj',
                render: (t) => (
                  <div className="flex items-center gap-2">
                    <span
                      style={{ background: whColor(t.sourceWarehouseId) }}
                      className="size-2 rounded-full"
                    />
                    <span className="font-medium">{whName(t.sourceWarehouseId)}</span>
                    <span className="text-muted">→</span>
                    <span
                      style={{ background: whColor(t.destinationWarehouseId) }}
                      className="size-2 rounded-full"
                    />
                    <span className="font-medium">{whName(t.destinationWarehouseId)}</span>
                  </div>
                ),
              },
              {
                key: 'items',
                label: 'Stavki',
                width: '100px',
                align: 'right',
                muted: true,
                render: (t) => t.items.length,
              },
            ]}
            rows={transfers.data.items}
            rowKey={(t) => t.id}
            onRowClick={(t) => navigate(`/premjestaj/${t.id}`)}
          />
        )}
      </div>
    </div>
  );
}
