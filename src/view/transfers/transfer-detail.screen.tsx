import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '@/view/common/components/page-header.component';
import { Card } from '@/view/common/components/card.component';
import { SectionTitle } from '@/view/common/components/section-title.component';
import { Spinner } from '@/view/common/components/spinner.component';
import { Table } from '@/view/common/components/table.component';
import { useTransfer } from './transfers.hook';
import { useWarehouses } from '@/view/warehouses/warehouses.hook';
import { useArticles } from '@/view/articles/articles.hook';
import { formatQuantity, UNIT_LABELS_HR } from '@/domain/common/unit';

export function TransferDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const transfer = useTransfer(id);
  const warehouses = useWarehouses();
  const articles = useArticles();

  if (transfer.isPending) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }
  if (transfer.isError || !transfer.data) {
    return (
      <div className="px-8 py-6">
        <Card padding="lg">
          <div className="text-danger text-2xs">Premještaj nije pronađen.</div>
        </Card>
      </div>
    );
  }

  const t = transfer.data;
  const source = warehouses.data?.find((w) => w.id === t.sourceWarehouseId);
  const dest = warehouses.data?.find((w) => w.id === t.destinationWarehouseId);
  const articlesById = new Map(articles.data?.map((a) => [a.id, a]) ?? []);

  return (
    <div>
      <PageHeader
        title={`Premještaj ${t.id.slice(0, 8).toUpperCase()}`}
        sub={
          <span className="inline-flex items-center gap-2">
            {source && (
              <>
                <span
                  style={{ background: source.color }}
                  className="size-2 rounded-full"
                />
                <span>{source.name}</span>
              </>
            )}
            <ArrowRight size={14} className="text-muted" />
            {dest && (
              <>
                <span
                  style={{ background: dest.color }}
                  className="size-2 rounded-full"
                />
                <span>{dest.name}</span>
              </>
            )}
            <span className="text-muted">·</span>
            <span>
              {new Date(t.createdAt).toLocaleString('hr-HR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </span>
        }
        breadcrumb={
          <>
            <Link to="/premjestaj" className="hover:text-text">
              Premještaji
            </Link>{' '}
            / {t.id.slice(0, 8).toUpperCase()}
          </>
        }
      />

      <div className="px-8 py-6 grid grid-cols-[2fr_1fr] gap-5">
        <div>
          <SectionTitle>Stavke ({t.items.length})</SectionTitle>
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
                width: '160px',
                align: 'right',
                render: (i) => {
                  const a = articlesById.get(i.articleId);
                  return a
                    ? `${formatQuantity(i.quantity, a.unit)} ${UNIT_LABELS_HR[a.unit]}`
                    : i.quantity;
                },
              },
            ]}
            rows={t.items}
            rowKey={(i) => i.id}
            onRowClick={(i) => navigate(`/artikli/${i.articleId}`)}
          />
        </div>

        <Card padding="lg" className="self-start">
          <SectionTitle>Podaci</SectionTitle>
          <div className="flex flex-col gap-2.5 text-[13px]">
            <div className="flex justify-between gap-3">
              <span className="text-muted">Šifra</span>
              <span className="font-mono">{t.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted">Izvor</span>
              <span className="font-medium text-right">{source?.name ?? '—'}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted">Odredište</span>
              <span className="font-medium text-right">{dest?.name ?? '—'}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted">Datum</span>
              <span className="font-medium">
                {new Date(t.createdAt).toLocaleDateString('hr-HR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </span>
            </div>
            {t.note && (
              <div className="pt-2 border-t border-border">
                <div className="text-muted mb-1">Napomena</div>
                <div className="text-text">{t.note}</div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
