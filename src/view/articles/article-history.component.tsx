import { useMemo } from 'react';
import { Pill } from '@/view/common/components/pill.component';
import { Table } from '@/view/common/components/table.component';
import { Spinner } from '@/view/common/components/spinner.component';
import { useArticleHistory } from './articles.hook';
import { ArticleHistoryEntry } from '@/domain/articles/articles.repository';

const ACTION_LABELS: Record<string, { label: string; color: 'success' | 'warning' | 'accent' | 'muted' | 'danger' }> = {
  ARTICLE_CREATED: { label: 'Stvoreno', color: 'accent' },
  ARTICLE_UPDATED: { label: 'Ažurirano', color: 'muted' },
  ARTICLE_DELETED: { label: 'Obrisano', color: 'danger' },
  PROCUREMENT_CREATED: { label: 'Nabava', color: 'success' },
  CORRECTION_CREATED: { label: 'Korekcija', color: 'warning' },
  STOCK_TRANSFER: { label: 'Premještaj', color: 'accent' },
  SALE_CREATED: { label: 'Prodaja', color: 'muted' },
};

interface ArticleHistorySectionProps {
  articleId: string;
}

export function ArticleHistorySection({ articleId }: ArticleHistorySectionProps) {
  const history = useArticleHistory(articleId);

  const rows = useMemo<ArticleHistoryEntry[]>(
    () => history.data?.items ?? [],
    [history.data],
  );

  if (history.isPending) {
    return (
      <div className="flex items-center justify-center py-10">
        <Spinner />
      </div>
    );
  }

  return (
    <Table
      cols={[
        {
          key: 'date',
          label: 'Datum',
          width: '160px',
          muted: true,
          render: (e) =>
            new Date(e.createdAt).toLocaleString('hr-HR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
        },
        {
          key: 'action',
          label: 'Tip',
          width: '140px',
          render: (e) => {
            const meta = ACTION_LABELS[e.action] ?? {
              label: e.action.toLowerCase().replace(/_/g, ' '),
              color: 'muted' as const,
            };
            return (
              <Pill color={meta.color} dot>
                {meta.label}
              </Pill>
            );
          },
        },
        {
          key: 'who',
          label: 'Korisnik',
          width: '180px',
          muted: true,
          render: (e) => e.user?.fullName ?? 'Sustav',
        },
        {
          key: 'detail',
          label: 'Promjena',
          muted: true,
          render: (e) => summarizeChange(e),
        },
      ]}
      rows={rows}
      rowKey={(e) => e.id}
      emptyMessage="Još nema zabilježenih promjena za ovaj artikl."
    />
  );
}

function summarizeChange(e: ArticleHistoryEntry): string {
  if (e.action === 'ARTICLE_CREATED') return 'Stvoren artikl';
  if (e.action === 'ARTICLE_DELETED') return 'Artikl obrisan';

  const before = e.before as Record<string, unknown> | null | undefined;
  const after = e.after as Record<string, unknown> | null | undefined;
  if (!before || !after) return '—';

  const changes: string[] = [];
  for (const key of Object.keys(after)) {
    if (key === 'updatedAt' || key === 'id') continue;
    const b = before[key];
    const a = after[key];
    if (JSON.stringify(b) !== JSON.stringify(a)) {
      changes.push(`${formatKey(key)}: ${stringify(b)} → ${stringify(a)}`);
    }
  }
  return changes.length ? changes.join(', ') : '—';
}

function formatKey(key: string): string {
  const map: Record<string, string> = {
    purchasePrice: 'nab. cijena',
    salePrice: 'prod. cijena',
    name: 'naziv',
    sku: 'SKU',
    unit: 'JM',
    thresholdWarning: 'prag upoz.',
    thresholdCritical: 'krit. prag',
    categoryId: 'kategorija',
    supplierId: 'dobavljač',
  };
  return map[key] ?? key;
}

function stringify(v: unknown): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? 'da' : 'ne';
  return JSON.stringify(v);
}
