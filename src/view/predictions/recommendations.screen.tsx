import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCcw, ShoppingCart } from 'lucide-react';
import { Button } from '@/view/common/components/button.component';
import { EmptyState } from '@/view/common/components/empty-state.component';
import { PageHeader } from '@/view/common/components/page-header.component';
import { Pill } from '@/view/common/components/pill.component';
import { Spinner } from '@/view/common/components/spinner.component';
import { toast } from '@/view/common/components/toast.component';
import { useArticles } from '@/view/articles/articles.hook';
import { useWarehouses } from '@/view/warehouses/warehouses.hook';
import { Urgency } from '@/domain/predictions/prediction-snapshot.domain';
import { NarrativeBlock } from './components/narrative-block.component';
import { RecommendationCard } from './components/recommendation-card.component';
import { useDailyDigest } from './narratives.hook';
import {
  useRecommendations,
  useRecomputeRecommendations,
} from './recommendations.hook';
import {
  useActiveShoppingList,
  useCreateShoppingList,
} from './shopping-list.hook';

const URGENCY_FILTERS: Array<{ label: string; value: Urgency | undefined }> = [
  { label: 'Sve', value: undefined },
  { label: 'Kritično', value: 'CRITICAL' },
  { label: 'Upozorenje', value: 'WARNING' },
];

export function RecommendationsScreen() {
  const navigate = useNavigate();
  const [urgency, setUrgency] = useState<Urgency | undefined>(undefined);

  const { data, isLoading } = useRecommendations({ urgency });
  const recompute = useRecomputeRecommendations();
  const digest = useDailyDigest();

  const articles = useArticles();
  const warehouses = useWarehouses();

  const articleById = useMemo(() => {
    const m = new Map<string, { name: string; unit: string }>();
    for (const a of articles.data ?? []) m.set(a.id, { name: a.name, unit: a.unit });
    return m;
  }, [articles.data]);
  const warehouseById = useMemo(() => {
    const m = new Map<string, string>();
    for (const w of warehouses.data ?? []) m.set(w.id, w.name);
    return m;
  }, [warehouses.data]);

  const groups = useMemo(() => {
    type Snap = NonNullable<typeof data>['items'][number];
    const m = new Map<string, Snap[]>();
    for (const s of data?.items ?? []) {
      const list = m.get(s.warehouseId) ?? [];
      list.push(s);
      m.set(s.warehouseId, list);
    }
    return Array.from(m.entries());
  }, [data]);

  const { data: activeList } = useActiveShoppingList();
  const createList = useCreateShoppingList();

  const startShopping = async () => {
    try {
      if (activeList) {
        navigate(`/shopping-mode/${activeList.id}`);
        return;
      }
      const created = await createList.mutateAsync();
      navigate(`/shopping-mode/${created.id}`);
    } catch (err) {
      toast.error('Greška', (err as Error).message);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <PageHeader
        title="Preporuke nabave"
        sub="Dnevni izračun stanja zaliha i prijedlozi za nabavu"
        actions={
          <>
            <Button
              variant="ghost"
              icon={<RefreshCcw size={14} />}
              onClick={() => recompute.mutate()}
              loading={recompute.isPending}
            >
              Ponovno izračunaj
            </Button>
            <Button
              variant="primary"
              icon={<ShoppingCart size={14} />}
              onClick={startShopping}
              loading={createList.isPending}
              disabled={
                (data?.summary.shouldReorderCount ?? 0) === 0 && !activeList
              }
            >
              {activeList ? 'Nastavi kupovinu' : 'Pokreni kupovinu'}
            </Button>
          </>
        }
      />
      <div className="flex-1 overflow-auto px-8 py-6 space-y-5">
        <NarrativeBlock
          body={digest.data?.body}
          isLoading={digest.isLoading}
          errorMessage={digest.error ? 'Sažetak trenutno nedostupan.' : null}
          modelHint={
            digest.data ? `Generirano: ${digest.data.modelUsed}` : undefined
          }
        />

        {data?.summary && (
          <div className="flex gap-2 flex-wrap text-2xs">
            <Pill color="danger" dot>
              {data.summary.criticalCount} kritičnih
            </Pill>
            <Pill color="warning" dot>
              {data.summary.warningCount} upozorenja
            </Pill>
            <Pill color="success" dot>
              {data.summary.okCount} u redu
            </Pill>
            <Pill color="accent">
              {data.summary.shouldReorderCount} za nabavu
            </Pill>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {URGENCY_FILTERS.map((f) => (
            <Button
              key={f.label}
              variant={urgency === f.value ? 'primary' : 'ghost'}
              size="xs"
              onClick={() => setUrgency(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        ) : (data?.items.length ?? 0) === 0 ? (
          <EmptyState
            title="Nema preporuka"
            description="Pokreni ponovni izračun ili pričekaj noćno osvježavanje."
          />
        ) : (
          <div className="space-y-6">
            {groups.map(([whId, snapshots]) => (
              <section key={whId} className="space-y-2">
                <div className="text-2xs uppercase tracking-wider text-muted font-medium">
                  {warehouseById.get(whId) ?? 'Skladište'}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {snapshots.map((s) => {
                    const art = articleById.get(s.articleId);
                    return (
                      <RecommendationCard
                        key={s.id}
                        snapshot={s}
                        articleName={art?.name ?? '—'}
                        articleUnit={art?.unit ?? ''}
                        warehouseName={warehouseById.get(s.warehouseId) ?? '—'}
                        onSelect={() =>
                          navigate(
                            `/recommendations/${s.articleId}/${s.warehouseId}`,
                          )
                        }
                      />
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
