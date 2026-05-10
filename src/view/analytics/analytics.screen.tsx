import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BarChart3 } from 'lucide-react';
import { PageHeader } from '@/view/common/components/page-header.component';
import { Button } from '@/view/common/components/button.component';
import { Card } from '@/view/common/components/card.component';
import { Stat } from '@/view/common/components/stat.component';
import { SectionTitle } from '@/view/common/components/section-title.component';
import { Spinner } from '@/view/common/components/spinner.component';
import { Table } from '@/view/common/components/table.component';
import { MiniBar } from '@/view/common/components/mini-bar.component';
import { Avatar } from '@/view/common/components/avatar.component';
import { Pill } from '@/view/common/components/pill.component';
import { EmptyState } from '@/view/common/components/empty-state.component';
import { useSalesReport } from './analytics.hook';
import { ReportPeriod } from '@/domain/analytics';
import { SHIFT_STATUS_LABELS_HR } from '@/domain/sales';
import { fmtMoney, fmtNumber } from '@/view/common/utils/format';
import { cn } from '@/view/common/utils/cn';

const PERIOD_LABELS: Record<ReportPeriod, string> = {
  day: 'Dan',
  week: 'Tjedan',
  month: 'Mjesec',
  year: 'Godina',
};
const PERIODS: ReportPeriod[] = ['day', 'week', 'month', 'year'];

export function AnalyticsScreen() {
  const [period, setPeriod] = useState<ReportPeriod>('week');
  const [offset, setOffset] = useState(0);
  const report = useSalesReport(period, offset);

  const maxRevenue = useMemo(() => {
    if (!report.data) return 0;
    return Math.max(...report.data.byDate.map((d) => Number(d.revenue) || 0));
  }, [report.data]);

  const maxQtyInArticles = useMemo(() => {
    if (!report.data) return 0;
    return Math.max(...report.data.byArticle.map((a) => Number(a.qty) || 0));
  }, [report.data]);

  const periodLabel = report.data?.period.label ?? '—';

  const changePeriod = (next: ReportPeriod) => {
    setPeriod(next);
    setOffset(0);
  };

  return (
    <div>
      <PageHeader
        title="Analitika prodaje"
        sub={`Period: ${periodLabel}`}
        breadcrumb="Analitika"
      />

      <div className="px-8 py-6 flex flex-col gap-5">
        {/* Period selector + nav */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 p-0.5 bg-card-hi border border-border rounded-md">
            {PERIODS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => changePeriod(p)}
                className={cn(
                  'px-3.5 py-1.5 text-[13px] rounded-sm transition-colors',
                  period === p
                    ? 'bg-card text-text font-medium'
                    : 'text-muted hover:text-text',
                )}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button size="xs" icon={<ArrowLeft size={13} />} onClick={() => setOffset((o) => o + 1)}>
              Prethodni
            </Button>
            <span className="text-[13px] text-muted px-3 min-w-[160px] text-center">
              {periodLabel}
            </span>
            <Button
              size="xs"
              icon={<ArrowRight size={13} />}
              onClick={() => setOffset((o) => Math.max(0, o - 1))}
              disabled={offset === 0}
            >
              Sljedeći
            </Button>
          </div>
        </div>

        {report.isPending ? (
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        ) : report.isError ? (
          <Card padding="lg">
            <div className="text-danger text-2xs">
              Greška pri dohvaćanju izvještaja. Pristup je ograničen na vlasnike i admine.
            </div>
          </Card>
        ) : (
          <>
            {/* KPI grid */}
            <div className="grid grid-cols-4 gap-4">
              <Stat
                label="Promet"
                value={fmtMoney(report.data.totals.revenue, report.data.totals.currency)}
                color="var(--accent)"
              />
              <Stat
                label="Ukupna količina"
                value={fmtNumber(report.data.totals.qty)}
                color="var(--success)"
              />
              <Stat
                label="Smjene"
                value={fmtNumber(report.data.shifts.length)}
                color="var(--muted)"
              />
              <Stat
                label="Različitih artikala"
                value={fmtNumber(report.data.byArticle.length)}
                color="var(--accent)"
              />
            </div>

            {/* Bar chart by date */}
            <Card padding="lg">
              <SectionTitle>
                Promet po danima ({periodLabel})
              </SectionTitle>
              {report.data.byDate.length === 0 ? (
                <p className="text-2xs text-muted text-center py-6 m-0">
                  Nema prometa u ovom razdoblju.
                </p>
              ) : (
                <div className="flex items-end gap-3 h-52 pt-5">
                  {report.data.byDate.map((d) => {
                    const value = Number(d.revenue) || 0;
                    const heightPct = maxRevenue ? (value / maxRevenue) * 100 : 0;
                    const date = new Date(d.date);
                    const label = date.toLocaleDateString('hr-HR', {
                      day: '2-digit',
                      month: '2-digit',
                    });
                    return (
                      <div
                        key={d.date}
                        className="flex-1 flex flex-col items-center gap-2 min-w-0"
                      >
                        <div className="text-2xs text-muted whitespace-nowrap">
                          {fmtMoney(value, report.data.totals.currency)}
                        </div>
                        <div className="w-full flex-1 flex items-end">
                          <div
                            style={{
                              height: `${heightPct}%`,
                              background: 'var(--accent)',
                            }}
                            className="w-full rounded-t-md min-h-1 transition-all"
                          />
                        </div>
                        <div className="text-2xs text-muted whitespace-nowrap">{label}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <div className="grid grid-cols-[1.4fr_1fr] gap-5">
              <div>
                <SectionTitle>Top artikli</SectionTitle>
                {report.data.byArticle.length === 0 ? (
                  <EmptyState
                    icon={<BarChart3 size={22} />}
                    title="Nema podataka."
                    description="U ovom razdoblju nije zabilježena prodaja po artiklima."
                  />
                ) : (
                  <Table
                    cols={[
                      {
                        key: 'name',
                        label: 'Artikl',
                        render: (a) => <span className="font-medium">{a.name}</span>,
                      },
                      {
                        key: 'qty',
                        label: 'Količina',
                        width: '200px',
                        render: (a) => (
                          <div className="inline-flex items-center gap-2">
                            <MiniBar
                              value={Number(a.qty) || 0}
                              max={maxQtyInArticles || 1}
                              color="var(--accent)"
                              width={80}
                              height={4}
                            />
                            <span className="tabular-nums">{fmtNumber(a.qty)}</span>
                          </div>
                        ),
                      },
                      {
                        key: 'revenue',
                        label: 'Promet',
                        width: '160px',
                        align: 'right',
                        render: (a) => (
                          <span className="font-medium">
                            {fmtMoney(a.revenue, report.data.totals.currency)}
                          </span>
                        ),
                      },
                    ]}
                    rows={report.data.byArticle.slice(0, 10)}
                    rowKey={(a) => a.articleId}
                  />
                )}
              </div>

              <div>
                <SectionTitle>Smjene u razdoblju</SectionTitle>
                {report.data.shifts.length === 0 ? (
                  <Card padding="lg">
                    <p className="text-2xs text-muted text-center py-2 m-0">
                      Nema smjena.
                    </p>
                  </Card>
                ) : (
                  <Table
                    cols={[
                      {
                        key: 'date',
                        label: 'Datum',
                        width: '110px',
                        render: (s) =>
                          new Date(s.date).toLocaleDateString('hr-HR', {
                            day: '2-digit',
                            month: '2-digit',
                          }),
                      },
                      {
                        key: 'closed',
                        label: 'Voditelj',
                        render: (s) =>
                          s.closedBy ? (
                            <div className="flex items-center gap-2">
                              <Avatar tone="muted" size={20} initials={s.closedBy.initials} />
                              <span className="text-[13px] truncate">
                                {s.closedBy.firstName} {s.closedBy.lastName}
                              </span>
                            </div>
                          ) : (
                            <Pill color="warning">{SHIFT_STATUS_LABELS_HR[s.status]}</Pill>
                          ),
                      },
                      {
                        key: 'revenue',
                        label: 'Promet',
                        width: '120px',
                        align: 'right',
                        render: (s) => fmtMoney(s.totalRevenue, report.data.totals.currency),
                      },
                    ]}
                    rows={report.data.shifts}
                    rowKey={(s) => s.id}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
