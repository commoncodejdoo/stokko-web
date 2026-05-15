import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/view/common/components/button.component';
import { Card } from '@/view/common/components/card.component';
import { PageHeader } from '@/view/common/components/page-header.component';
import { Spinner } from '@/view/common/components/spinner.component';
import { useArticle } from '@/view/articles/articles.hook';
import { useWarehouse } from '@/view/warehouses/warehouses.hook';
import { NarrativeBlock } from './components/narrative-block.component';
import { UrgencyBadge } from './components/urgency-badge.component';
import { useExplainItem } from './narratives.hook';
import { useRecommendations } from './recommendations.hook';

export function RecommendationDetailScreen() {
  const navigate = useNavigate();
  const { articleId = '', warehouseId = '' } = useParams<{
    articleId: string;
    warehouseId: string;
  }>();

  const article = useArticle(articleId);
  const warehouse = useWarehouse(warehouseId);
  const { data } = useRecommendations();
  const snapshot = data?.items.find(
    (s) => s.articleId === articleId && s.warehouseId === warehouseId,
  );
  const explain = useExplainItem();

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <PageHeader
        breadcrumb={
          <button
            type="button"
            onClick={() => navigate('/recommendations')}
            className="inline-flex items-center gap-1 hover:text-text cursor-pointer"
          >
            <ArrowLeft size={11} /> Preporuke
          </button>
        }
        title={article.data?.name ?? 'Detalj preporuke'}
        sub={warehouse.data?.name ?? ''}
        actions={
          <Button
            variant="primary"
            icon={<Sparkles size={14} />}
            onClick={() => explain.mutate({ articleId, warehouseId })}
            loading={explain.isPending}
          >
            {explain.isPending ? 'Razmišljam…' : 'Zašto naručiti?'}
          </Button>
        }
      />
      <div className="flex-1 overflow-auto px-8 py-6 space-y-5 max-w-3xl">
        {!snapshot ? (
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        ) : (
          <>
            <Card padding="lg">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="text-[18px] font-semibold">
                    {article.data?.name ?? '—'}
                  </div>
                  <div className="text-2xs text-muted mt-1">
                    {warehouse.data?.name ?? '—'} · SKU{' '}
                    {article.data?.sku ?? '—'}
                  </div>
                </div>
                <UrgencyBadge urgency={snapshot.urgency} />
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
                <Row
                  label="Trenutno stanje"
                  value={`${Number(snapshot.currentStock).toFixed(3)} ${article.data?.unit ?? ''}`}
                />
                <Row
                  label="Prosječna dnevna potrošnja"
                  value={
                    snapshot.avgDailyConsumption
                      ? `${Number(snapshot.avgDailyConsumption).toFixed(3)} ${article.data?.unit ?? ''}`
                      : 'Nepoznato'
                  }
                />
                <Row
                  label="Dana zaliha"
                  value={
                    snapshot.daysOfSupply
                      ? `${Number(snapshot.daysOfSupply).toFixed(1)} dana`
                      : '—'
                  }
                />
                <Row
                  label="Prijedlog za nabavu"
                  value={`${Number(snapshot.suggestedQty).toFixed(0)} ${article.data?.unit ?? ''}`}
                  emphasis
                />
                <Row
                  label="Parametri"
                  value={`lead ${snapshot.leadTimeDaysUsed}d · safety ${snapshot.safetyDaysUsed}d · coverage ${snapshot.coverageDaysUsed}d`}
                  small
                  span={2}
                />
                <Row
                  label="Izračunato"
                  value={new Date(snapshot.computedAt).toLocaleString('hr-HR')}
                  small
                  span={2}
                />
              </div>
            </Card>

            <NarrativeBlock
              body={explain.data?.body}
              isLoading={explain.isPending}
              errorMessage={
                explain.error ? 'Objašnjenje trenutno nedostupno.' : null
              }
              modelHint={
                explain.data
                  ? `Generirano: ${explain.data.modelUsed} · ${explain.data.cachedTokens}/${explain.data.tokensIn} cache`
                  : undefined
              }
            />
          </>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  small,
  emphasis,
  span,
}: {
  label: string;
  value: string;
  small?: boolean;
  emphasis?: boolean;
  span?: number;
}) {
  return (
    <div className={span === 2 ? 'col-span-2' : ''}>
      <div className="text-2xs text-muted uppercase tracking-wider">{label}</div>
      <div
        className={
          small
            ? 'text-2xs text-muted mt-0.5'
            : emphasis
              ? 'text-[16px] font-semibold mt-0.5'
              : 'text-[14px] font-medium mt-0.5'
        }
      >
        {value}
      </div>
    </div>
  );
}
