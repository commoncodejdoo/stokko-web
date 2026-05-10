import { useNavigate } from 'react-router-dom';
import { Plus, Calendar } from 'lucide-react';
import { PageHeader } from '@/view/common/components/page-header.component';
import { Button } from '@/view/common/components/button.component';
import { Card } from '@/view/common/components/card.component';
import { Spinner } from '@/view/common/components/spinner.component';
import { EmptyState } from '@/view/common/components/empty-state.component';
import { Table } from '@/view/common/components/table.component';
import { Pill } from '@/view/common/components/pill.component';
import { useShifts } from './shifts.hook';
import { SHIFT_STATUS_LABELS_HR } from '@/domain/sales';
import { fmtMoney, fmtNumber } from '@/view/common/utils/format';

export function ShiftsListScreen() {
  const navigate = useNavigate();
  const shifts = useShifts({ pageSize: 50 });

  return (
    <div>
      <PageHeader
        title="Smjene"
        sub={shifts.data ? `${shifts.data.pagination.total} smjena` : undefined}
        breadcrumb="Smjene"
        actions={
          <Button
            variant="primary"
            icon={<Plus size={14} />}
            onClick={() => navigate('/shifts/close')}
          >
            Zatvori smjenu
          </Button>
        }
      />
      <div className="px-8 py-6">
        {shifts.isPending ? (
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        ) : shifts.isError ? (
          <Card padding="lg">
            <div className="text-danger text-2xs">Greška pri dohvaćanju smjena.</div>
          </Card>
        ) : shifts.data.items.length === 0 ? (
          <EmptyState
            icon={<Calendar size={28} />}
            title="Još nema smjena"
            description="Smjena se otvara automatski kad prvi put zatvoriš obračun. Krenula bi smjena za danas?"
            action={
              <Button
                variant="primary"
                icon={<Plus size={14} />}
                onClick={() => navigate('/shifts/close')}
              >
                Zatvori smjenu
              </Button>
            }
          />
        ) : (
          <Table
            cols={[
              {
                key: 'date',
                label: 'Datum',
                width: '140px',
                render: (s) =>
                  new Date(s.date).toLocaleDateString('hr-HR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  }),
              },
              {
                key: 'status',
                label: 'Status',
                width: '140px',
                render: (s) => (
                  <Pill color={s.status === 'CLOSED' ? 'success' : 'warning'} dot>
                    {SHIFT_STATUS_LABELS_HR[s.status]}
                  </Pill>
                ),
              },
              {
                key: 'closedAt',
                label: 'Zatvoreno',
                muted: true,
                render: (s) =>
                  s.closedAt
                    ? new Date(s.closedAt).toLocaleString('hr-HR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—',
              },
              {
                key: 'qty',
                label: 'Količina',
                width: '120px',
                align: 'right',
                muted: true,
                render: (s) => fmtNumber(s.totalQuantity),
              },
              {
                key: 'revenue',
                label: 'Promet',
                width: '160px',
                align: 'right',
                render: (s) => (
                  <span className="font-medium">{fmtMoney(s.totalRevenue, s.currency)}</span>
                ),
              },
            ]}
            rows={shifts.data.items}
            rowKey={(s) => s.id}
            onRowClick={(s) => navigate(`/shifts/${s.id}`)}
          />
        )}
      </div>
    </div>
  );
}
