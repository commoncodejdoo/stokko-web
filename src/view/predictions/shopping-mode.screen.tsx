import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X } from 'lucide-react';
import { Button } from '@/view/common/components/button.component';
import { EmptyState } from '@/view/common/components/empty-state.component';
import { PageHeader } from '@/view/common/components/page-header.component';
import { Spinner } from '@/view/common/components/spinner.component';
import { toast } from '@/view/common/components/toast.component';
import { useArticles } from '@/view/articles/articles.hook';
import { useWarehouses } from '@/view/warehouses/warehouses.hook';
import { ShoppingListItemRow } from './components/shopping-list-item-row.component';
import {
  useCancelShoppingList,
  useCompleteShoppingList,
  useRemoveShoppingListItem,
  useShoppingList,
  useUpdateShoppingListItem,
} from './shopping-list.hook';

export function ShoppingModeScreen() {
  const navigate = useNavigate();
  const { id: listId = '' } = useParams<{ id: string }>();

  const { data: list, isLoading } = useShoppingList(listId);
  const updateItem = useUpdateShoppingListItem(listId);
  const removeItem = useRemoveShoppingListItem(listId);
  const completeList = useCompleteShoppingList(listId);
  const cancelList = useCancelShoppingList(listId);

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

  const onComplete = async () => {
    if (!list) return;
    if (
      !window.confirm(
        `Spremit ću ${list.checkedItems().length} stavku u nabavu (≈ ${(
          list.checkedTotalCents() / 100
        ).toFixed(2)} EUR). Nastavi?`,
      )
    ) {
      return;
    }
    try {
      await completeList.mutateAsync();
      navigate('/procurements');
    } catch (err) {
      toast.error('Greška', (err as Error).message);
    }
  };

  const onCancel = async () => {
    if (!window.confirm('Otkazati listu? Stavke neće biti spremljene.')) {
      return;
    }
    try {
      await cancelList.mutateAsync();
      navigate('/recommendations');
    } catch (err) {
      toast.error('Greška', (err as Error).message);
    }
  };

  const totalEur = list ? (list.checkedTotalCents() / 100).toFixed(2) : '0.00';
  const checkedCount = list?.checkedItems().length ?? 0;

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
        title="Kupovina"
        sub={
          list
            ? `${checkedCount} od ${list.items.length} odabrano · ≈ ${totalEur} EUR`
            : 'Lista za kupovinu'
        }
        actions={
          <>
            <Button
              variant="danger"
              icon={<X size={14} />}
              onClick={onCancel}
              loading={cancelList.isPending}
              disabled={!list || !list.isActive()}
            >
              Otkaži
            </Button>
            <Button
              variant="primary"
              icon={<Check size={14} />}
              onClick={onComplete}
              loading={completeList.isPending}
              disabled={checkedCount === 0 || !list?.isActive()}
            >
              Spremi u nabavu
            </Button>
          </>
        }
      />
      <div className="flex-1 overflow-auto px-8 py-6 max-w-3xl">
        {isLoading || !list ? (
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        ) : list.items.length === 0 ? (
          <EmptyState
            title="Lista je prazna"
            description="Nema artikala za nabavu — sve zalihe su u redu."
          />
        ) : (
          <div className="space-y-1.5">
            {list.items.map((it) => {
              const art = articleById.get(it.articleId);
              return (
                <ShoppingListItemRow
                  key={it.id}
                  item={it}
                  articleName={art?.name ?? '—'}
                  articleUnit={art?.unit ?? ''}
                  warehouseName={warehouseById.get(it.warehouseId) ?? '—'}
                  onToggle={() =>
                    updateItem.mutate({
                      itemId: it.id,
                      payload: { isChecked: !it.isChecked },
                    })
                  }
                  onRemove={() => removeItem.mutate(it.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
