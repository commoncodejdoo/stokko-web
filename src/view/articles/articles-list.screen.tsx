import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Package } from 'lucide-react';
import { PageHeader } from '@/view/common/components/page-header.component';
import { Button } from '@/view/common/components/button.component';
import { Card } from '@/view/common/components/card.component';
import { Spinner } from '@/view/common/components/spinner.component';
import { EmptyState } from '@/view/common/components/empty-state.component';
import { Table } from '@/view/common/components/table.component';
import { Pill } from '@/view/common/components/pill.component';
import { MiniBar } from '@/view/common/components/mini-bar.component';
import { useAuthStore } from '@/view/common/store/auth-store';
import { canEditCatalog } from '@/domain/common/role';
import { formatQuantity, UNIT_LABELS_HR } from '@/domain/common/unit';
import { fmtMoney } from '@/view/common/utils/format';
import { useArticles } from './articles.hook';
import { useCategories } from '@/view/categories/categories.hook';
import { useWarehouses } from '@/view/warehouses/warehouses.hook';
import { ArticleFormModal } from './article-form.modal';
import { cn } from '@/view/common/utils/cn';

export function ArticlesListScreen() {
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user?.role);
  const canCreate = role ? canEditCatalog(role) : false;
  const [q, setQ] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [createOpen, setCreateOpen] = useState(false);

  const articles = useArticles({ q: q || undefined, categoryId: categoryId || undefined });
  const categories = useCategories();
  const warehouses = useWarehouses();

  const warehousesById = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    warehouses.data?.forEach((w) => map.set(w.id, { name: w.name, color: w.color }));
    return map;
  }, [warehouses.data]);

  return (
    <div>
      <PageHeader
        title="Artikli"
        sub={articles.data ? `${articles.data.length} artikala` : undefined}
        breadcrumb="Artikli"
        actions={
          canCreate && (
            <Button
              variant="primary"
              icon={<Plus size={14} />}
              onClick={() => setCreateOpen(true)}
            >
              Novi artikl
            </Button>
          )
        }
      />

      <div className="px-8 py-6">
        {/* Toolbar */}
        <div className="flex gap-2 mb-4 items-center flex-wrap">
          <div className="relative flex-1 max-w-xs min-w-[180px]">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Pretraži po nazivu ili SKU…"
              className="w-full pl-8 pr-3 py-1.5 bg-card-hi border border-border rounded-md text-text text-[13px] focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          {categories.data && categories.data.length > 0 && (
            <div className="flex gap-1 p-0.5 bg-card-hi border border-border rounded-md overflow-x-auto max-w-2xl">
              <button
                type="button"
                onClick={() => setCategoryId('')}
                className={cn(
                  'px-2.5 py-1 text-2xs rounded-sm whitespace-nowrap transition-colors',
                  categoryId === ''
                    ? 'bg-card text-text font-medium'
                    : 'text-muted hover:text-text',
                )}
              >
                Sve
              </button>
              {categories.data.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  className={cn(
                    'px-2.5 py-1 text-2xs rounded-sm whitespace-nowrap transition-colors',
                    categoryId === c.id
                      ? 'bg-card text-text font-medium'
                      : 'text-muted hover:text-text',
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {articles.isPending ? (
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        ) : articles.isError ? (
          <Card padding="lg">
            <div className="text-danger text-2xs">Greška pri dohvaćanju artikala.</div>
          </Card>
        ) : articles.data.length === 0 ? (
          <EmptyState
            icon={<Package size={28} />}
            title={q || categoryId ? 'Nema rezultata.' : 'Još nema artikala.'}
            description={
              q || categoryId
                ? 'Pokušaj s drugim filterom ili pretragom.'
                : 'Dodaj prvi artikl kako bi mogao pratiti zalihe.'
            }
            action={
              canCreate &&
              !q &&
              !categoryId && (
                <Button
                  variant="primary"
                  icon={<Plus size={14} />}
                  onClick={() => setCreateOpen(true)}
                >
                  Novi artikl
                </Button>
              )
            }
          />
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
                key: 'cat',
                label: 'Kategorija',
                width: '140px',
                render: (a) => {
                  const c = categories.data?.find((x) => x.id === a.categoryId);
                  return c ? <Pill>{c.name}</Pill> : '—';
                },
              },
              {
                key: 'wh',
                label: 'Skladišta',
                width: '180px',
                render: (a) =>
                  a.stockByWarehouse && a.stockByWarehouse.length > 0 ? (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {a.stockByWarehouse.slice(0, 3).map((s) => {
                        const w = warehousesById.get(s.warehouseId);
                        return w ? (
                          <span
                            key={s.warehouseId}
                            className="inline-flex items-center gap-1 text-2xs"
                          >
                            <span
                              style={{ background: w.color }}
                              className="size-2 rounded-full"
                            />
                            {w.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <span className="text-muted text-2xs">—</span>
                  ),
              },
              {
                key: 'stock',
                label: 'Ukupno',
                width: '160px',
                align: 'right',
                render: (a) => {
                  const total = Number(a.totalQuantity) || 0;
                  const threshold = Number(a.thresholdWarning) || 1;
                  const max = Math.max(total, threshold * 2);
                  const isLow = a.status === 'WARNING' || a.status === 'CRITICAL';
                  return (
                    <div className="inline-flex items-center gap-2">
                      <MiniBar
                        value={Math.min(total, max)}
                        max={max}
                        color={isLow ? 'var(--warning)' : 'var(--success)'}
                        width={60}
                        height={4}
                      />
                      <span
                        className={cn('font-medium tabular-nums', isLow && 'text-warning')}
                      >
                        {formatQuantity(a.totalQuantity, a.unit)} {UNIT_LABELS_HR[a.unit]}
                      </span>
                    </div>
                  );
                },
              },
              {
                key: 'price',
                label: 'Cijena',
                width: '130px',
                align: 'right',
                render: (a) => fmtMoney(a.purchasePrice, a.currency),
              },
            ]}
            rows={articles.data}
            rowKey={(a) => a.id}
            onRowClick={(a) => navigate(`/articles/${a.id}`)}
          />
        )}
      </div>

      <ArticleFormModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
