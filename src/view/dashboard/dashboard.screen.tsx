import { useNavigate } from 'react-router-dom';
import { Plus, Download } from 'lucide-react';
import { PageHeader } from '@/view/common/components/page-header.component';
import { Card } from '@/view/common/components/card.component';
import { Button } from '@/view/common/components/button.component';
import { Stat } from '@/view/common/components/stat.component';
import { SectionTitle } from '@/view/common/components/section-title.component';
import { Avatar } from '@/view/common/components/avatar.component';
import { Spinner } from '@/view/common/components/spinner.component';
import { Table } from '@/view/common/components/table.component';
import { Pill } from '@/view/common/components/pill.component';
import { useAuthStore } from '@/view/common/store/auth-store';
import { fmtMoney, fmtNumber } from '@/view/common/utils/format';
import { sparklineStub } from '@/view/common/utils/sparkline-stub';
import {
  DashboardActivityEntry,
  DashboardWarehouseStat,
} from '@/domain/dashboard/dashboard.domain';
import { RecommendationsBanner } from '@/view/predictions/components/recommendations-banner.component';
import { useRecommendations } from '@/view/predictions/recommendations.hook';
import { formatActivity, formatRelativeTime } from './activity-format';
import { useDashboardOverview } from './dashboard.hook';

export function DashboardScreen() {
  const navigate = useNavigate();
  const organization = useAuthStore((s) => s.organization);
  const overview = useDashboardOverview();
  const recommendations = useRecommendations();
  const summary = recommendations.data?.summary;
  const currency = organization?.currency ?? 'EUR';

  return (
    <div>
      <PageHeader
        title="Početna"
        sub="Pregled trenutnog stanja inventara"
        breadcrumb={organization?.name}
        actions={
          <>
            <Button icon={<Download size={14} />} disabled>
              Izvoz
            </Button>
            <Button
              variant="primary"
              icon={<Plus size={14} />}
              onClick={() => navigate('/procurements')}
            >
              Nova nabava
            </Button>
          </>
        }
      />

      <div className="px-8 py-6 flex flex-col gap-6">
        {summary && (
          <RecommendationsBanner
            criticalCount={summary.criticalCount}
            warningCount={summary.warningCount}
            shouldReorderCount={summary.shouldReorderCount}
          />
        )}
        {overview.isPending ? (
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        ) : overview.isError ? (
          <Card padding="lg">
            <div className="text-danger text-2xs">
              Greška pri dohvaćanju podataka. Pokušaj osvježiti stranicu.
            </div>
          </Card>
        ) : (
          <>
            {/* KPI grid — sparkline trend is a deterministic stub until
                the daily-snapshot backend table lands (Phase W9). */}
            <div className="grid grid-cols-4 gap-4">
              <Stat
                label="Skladišta"
                value={fmtNumber(overview.data.counts.warehouses)}
                trend={sparklineStub({
                  seed: `wh-${overview.data.counts.warehouses}`,
                  endValue: overview.data.counts.warehouses,
                  volatility: 0.08,
                })}
                color="var(--accent)"
              />
              <Stat
                label="Artikala"
                value={fmtNumber(overview.data.counts.articles)}
                trend={sparklineStub({
                  seed: `art-${overview.data.counts.articles}`,
                  endValue: overview.data.counts.articles,
                  volatility: 0.1,
                })}
                color="var(--success)"
              />
              <Stat
                label="Niska zaliha"
                value={fmtNumber(overview.data.counts.lowStockCount)}
                trend={sparklineStub({
                  seed: `low-${overview.data.counts.lowStockCount}`,
                  endValue: Math.max(1, overview.data.counts.lowStockCount),
                  volatility: 0.25,
                })}
                color="var(--warning)"
              />
              <Stat
                label="Nabave danas"
                value={fmtNumber(overview.data.counts.todayProcurementsCount)}
                trend={sparklineStub({
                  seed: `proc-${overview.data.counts.todayProcurementsCount}`,
                  endValue: Math.max(1, overview.data.counts.todayProcurementsCount),
                  volatility: 0.3,
                })}
                color="var(--accent)"
              />
            </div>

            {/* Per warehouse + activity */}
            <div className="grid grid-cols-[1.4fr_1fr] gap-4">
              <Card padding="lg">
                <SectionTitle>Po skladištu</SectionTitle>
                <PerWarehouseChart items={overview.data.perWarehouse} currency={currency} />
              </Card>

              <Card padding="lg">
                <SectionTitle>Aktivnost</SectionTitle>
                <RecentActivity items={overview.data.recentActivity.slice(0, 6)} />
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PerWarehouseChart({
  items,
  currency,
}: {
  items: DashboardWarehouseStat[];
  currency: string;
}) {
  if (!items.length) {
    return <div className="text-2xs text-muted py-10 text-center">Nema skladišta.</div>;
  }
  const max = Math.max(...items.map((w) => Number(w.totalValue) || 0)) || 1;

  return (
    <div className="flex items-end gap-6 h-52 pt-5">
      {items.map((w) => {
        const value = Number(w.totalValue) || 0;
        const heightPct = (value / max) * 100;
        return (
          <div key={w.warehouseId} className="flex-1 flex flex-col items-center gap-2 min-w-0">
            <div className="text-2xs text-muted">{fmtMoney(value, currency)}</div>
            <div className="w-full flex-1 flex items-end">
              <div
                style={{ height: `${heightPct}%`, background: w.color }}
                className="w-full rounded-t-md min-h-1 transition-all"
              />
            </div>
            <div className="text-[12px] font-medium text-text truncate w-full text-center">
              {w.name}
            </div>
            <div className="text-2xs text-muted">{w.articleCount} art.</div>
          </div>
        );
      })}
    </div>
  );
}

function RecentActivity({ items }: { items: DashboardActivityEntry[] }) {
  if (!items.length) {
    return <div className="text-2xs text-muted py-6 text-center">Nema nedavnih aktivnosti.</div>;
  }
  return (
    <Table
      cols={[
        {
          key: 'who',
          label: 'Tko',
          render: (a) => (
            <div className="flex items-center gap-2">
              <Avatar
                tone="accent"
                size={24}
                initials={a.user?.initials ?? '·'}
              />
              <div className="text-[13px] font-medium truncate">
                {a.user?.fullName ?? 'Sustav'}
              </div>
            </div>
          ),
          width: '160px',
        },
        {
          key: 'what',
          label: 'Akcija',
          render: (a) => <span className="text-[13px]">{formatActivity(a)}</span>,
        },
        {
          key: 'when',
          label: 'Kada',
          align: 'right',
          muted: true,
          render: (a) => formatRelativeTime(a.createdAt),
          width: '90px',
        },
      ]}
      rows={items}
      rowKey={(a) => a.id}
    />
  );
}

// Inline so we don't need a separate badge color computation for now.
// Pill is unused here but imported for future expansion.
void Pill;
