import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '@/view/common/components/page-header.component';
import { Card } from '@/view/common/components/card.component';
import { SectionTitle } from '@/view/common/components/section-title.component';
import { Spinner } from '@/view/common/components/spinner.component';
import { Table } from '@/view/common/components/table.component';
import { Pill } from '@/view/common/components/pill.component';
import { useProcurement } from './procurements.hook';
import { useArticles } from '@/view/articles/articles.hook';
import { useWarehouses } from '@/view/warehouses/warehouses.hook';
import { useSuppliers } from '@/view/suppliers/suppliers.hook';
import { fmtMoney } from '@/view/common/utils/format';
import { formatQuantity, UNIT_LABELS_HR } from '@/domain/common/unit';

export function ProcurementDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const procurement = useProcurement(id);
  const articles = useArticles();
  const warehouses = useWarehouses();
  const suppliers = useSuppliers();

  if (procurement.isPending) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }
  if (procurement.isError || !procurement.data) {
    return (
      <div className="px-8 py-6">
        <Card padding="lg">
          <div className="text-danger text-2xs">Nabava nije pronađena.</div>
        </Card>
      </div>
    );
  }
  const p = procurement.data;
  const warehouse = warehouses.data?.find((w) => w.id === p.warehouseId);
  const supplier = p.supplierId ? suppliers.data?.find((s) => s.id === p.supplierId) : null;

  const articlesById = new Map(articles.data?.map((a) => [a.id, a]) ?? []);

  return (
    <div>
      <PageHeader
        title={`Nabava ${p.id.slice(0, 8).toUpperCase()}`}
        sub={
          <span className="inline-flex items-center gap-3">
            {warehouse && (
              <span className="inline-flex items-center gap-1.5">
                <span
                  style={{ background: warehouse.color }}
                  className="size-2 rounded-full"
                />
                {warehouse.name}
              </span>
            )}
            <span>•</span>
            <span>
              {new Date(p.createdAt).toLocaleString('hr-HR', {
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
            <Link to="/procurements" className="hover:text-text">
              Nabave
            </Link>{' '}
            / {p.id.slice(0, 8).toUpperCase()}
          </>
        }
      />

      <div className="px-8 py-6 grid grid-cols-[2fr_1fr] gap-5">
        <div className="flex flex-col gap-4">
          <div>
            <SectionTitle>Stavke ({p.items.length})</SectionTitle>
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
                  render: (i) => {
                    const a = articlesById.get(i.articleId);
                    return <span className="font-medium">{a?.name ?? i.articleId}</span>;
                  },
                },
                {
                  key: 'qty',
                  label: 'Količina',
                  width: '130px',
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
                  render: (i) => fmtMoney(i.purchasePrice, p.currency),
                },
                {
                  key: 'total',
                  label: 'Ukupno',
                  width: '140px',
                  align: 'right',
                  render: (i) => (
                    <span className="font-medium">{fmtMoney(i.lineTotal, p.currency)}</span>
                  ),
                },
              ]}
              rows={p.items}
              rowKey={(i) => i.id}
            />
          </div>
          <div className="flex justify-end">
            <Card padding="md" className="min-w-[280px]">
              <div className="flex flex-col gap-1.5 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-muted">Osnovica</span>
                  <span>{fmtMoney(Number(p.totalValue) / 1.25, p.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">PDV (25%)</span>
                  <span>
                    {fmtMoney(Number(p.totalValue) - Number(p.totalValue) / 1.25, p.currency)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border font-semibold text-[15px]">
                  <span>Ukupno</span>
                  <span>{fmtMoney(p.totalValue, p.currency)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <Card padding="lg" className="self-start">
          <SectionTitle>Podaci</SectionTitle>
          <div className="flex flex-col gap-2.5 text-[13px]">
            <div className="flex justify-between gap-3">
              <span className="text-muted">Šifra</span>
              <span className="font-mono">{p.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted">Skladište</span>
              <span className="font-medium text-right">{warehouse?.name ?? '—'}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted">Dobavljač</span>
              <span className="font-medium text-right">
                {supplier?.name ?? <span className="italic text-muted">Bez dobavljača</span>}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted">Datum</span>
              <span className="font-medium">
                {new Date(p.createdAt).toLocaleDateString('hr-HR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted">Status</span>
              <Pill color="success" dot>
                Evidentirano
              </Pill>
            </div>
            {p.note && (
              <div className="pt-2 border-t border-border">
                <div className="text-muted mb-1">Napomena</div>
                <div className="text-text">{p.note}</div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
