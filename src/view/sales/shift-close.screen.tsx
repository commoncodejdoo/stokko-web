import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Minus, Plus } from 'lucide-react';
import { PageHeader } from '@/view/common/components/page-header.component';
import { Button } from '@/view/common/components/button.component';
import { Card } from '@/view/common/components/card.component';
import { SectionTitle } from '@/view/common/components/section-title.component';
import { Spinner } from '@/view/common/components/spinner.component';
import { EmptyState } from '@/view/common/components/empty-state.component';
import { useWarehouses, useWarehouseArticles } from '@/view/warehouses/warehouses.hook';
import { useAuthStore } from '@/view/common/store/auth-store';
import { fmtMoney, fmtNumber } from '@/view/common/utils/format';
import { formatQuantity, UNIT_LABELS_HR } from '@/domain/common/unit';
import { cn } from '@/view/common/utils/cn';
import { useCloseShift } from './shifts.hook';

/** Composite key: `${articleId}|${warehouseId}` → quantity string. */
type DraftMap = Map<string, string>;

const keyOf = (articleId: string, warehouseId: string) => `${articleId}|${warehouseId}`;
const normalizeDecimal = (s: string) => s.replace(',', '.').trim();
const isValidQty = (s: string) =>
  s.trim() === '' || /^\d+(\.\d+)?$/.test(normalizeDecimal(s));

export function ShiftCloseScreen() {
  const navigate = useNavigate();
  const organization = useAuthStore((s) => s.organization);
  const user = useAuthStore((s) => s.user);
  const currency = organization?.currency ?? 'EUR';

  const warehouses = useWarehouses();
  const closeShift = useCloseShift();

  const fohWarehouses = useMemo(
    () => warehouses.data?.filter((w) => w.kind === 'FOH') ?? [],
    [warehouses.data],
  );

  const [activeWarehouseId, setActiveWarehouseId] = useState<string>('');
  const [drafts, setDrafts] = useState<DraftMap>(new Map());
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeWarehouseId && fohWarehouses.length > 0) {
      setActiveWarehouseId(fohWarehouses[0].id);
    }
  }, [fohWarehouses, activeWarehouseId]);

  const activeArticles = useWarehouseArticles(activeWarehouseId || undefined);

  const getQty = (articleId: string, warehouseId: string): string =>
    drafts.get(keyOf(articleId, warehouseId)) ?? '';

  const setQty = (articleId: string, warehouseId: string, qty: string) => {
    setDrafts((prev) => {
      const next = new Map(prev);
      if (qty === '' || qty === '0') {
        next.delete(keyOf(articleId, warehouseId));
      } else {
        next.set(keyOf(articleId, warehouseId), qty);
      }
      return next;
    });
  };

  const adjustQty = (
    articleId: string,
    warehouseId: string,
    delta: number,
  ) => {
    const current = Number(normalizeDecimal(getQty(articleId, warehouseId))) || 0;
    const next = Math.max(0, current + delta);
    setQty(articleId, warehouseId, next === 0 ? '' : String(next));
  };

  /** Aggregated summary across ALL FOH warehouses, not just active tab. */
  const summary = useMemo(() => {
    let totalQty = 0;
    let totalRevenue = 0;
    let lineCount = 0;
    drafts.forEach((qty, key) => {
      const n = Number(normalizeDecimal(qty));
      if (!Number.isFinite(n) || n <= 0) return;
      lineCount++;
      totalQty += n;
      // We don't have all article prices here; estimate per-warehouse later.
      // Backend will compute authoritative totals; UI shows quantity sum + 0 for revenue.
      // Compute revenue per active warehouse on-the-fly below for accuracy.
      const _ = key;
      void _;
    });
    // Compute revenue by iterating activeArticles' salePrice when key matches.
    if (activeArticles.data) {
      drafts.forEach((qty, key) => {
        const [articleId, warehouseId] = key.split('|');
        if (warehouseId !== activeWarehouseId) return;
        const a = activeArticles.data!.items.find((x) => x.articleId === articleId);
        if (!a) return;
        const n = Number(normalizeDecimal(qty)) || 0;
        totalRevenue += n * (Number(a.purchasePrice) || 0); // proxy until salePrice is on warehouse-articles
      });
    }
    return { totalQty, totalRevenue, lineCount };
  }, [drafts, activeArticles.data, activeWarehouseId]);

  const handleSubmit = async () => {
    setSubmitError(null);
    const items: { articleId: string; warehouseId: string; quantity: string }[] = [];
    drafts.forEach((qty, key) => {
      const n = Number(normalizeDecimal(qty));
      if (!Number.isFinite(n) || n <= 0) return;
      const [articleId, warehouseId] = key.split('|');
      items.push({ articleId, warehouseId, quantity: normalizeDecimal(qty) });
    });
    if (items.length === 0) {
      setSubmitError('Unesi barem jednu stavku s pozitivnom količinom.');
      return;
    }
    try {
      const { shift } = await closeShift.mutateAsync({ items });
      navigate(`/smjena/${shift.id}`, { replace: true });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Greška pri zatvaranju smjene.');
    }
  };

  if (warehouses.isPending) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (fohWarehouses.length === 0) {
    return (
      <div>
        <PageHeader
          title="Obračun smjene"
          breadcrumb="Smjena"
          sub="Označi prodano i evidentiraj rashod"
        />
        <div className="px-8 py-6">
          <EmptyState
            title="Nema FOH skladišta."
            description="Obračun smjene radi samo na skladištima tipa FOH (front-of-house, npr. Sala, Bar). Otvori postavke skladišta i promijeni tip ako trebaš."
            action={
              <Button onClick={() => navigate('/skladista')}>Upravljaj skladištima</Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Obračun smjene"
        breadcrumb="Smjena"
        sub="Označi prodano i evidentiraj rashod"
        actions={
          <>
            <Button onClick={() => navigate('/')} disabled={closeShift.isPending}>
              Odustani
            </Button>
            <Button
              variant="primary"
              icon={<Check size={14} />}
              onClick={handleSubmit}
              loading={closeShift.isPending}
              disabled={summary.lineCount === 0}
            >
              Zatvori smjenu
            </Button>
          </>
        }
      />

      <div className="px-8 py-6 grid grid-cols-[1fr_320px] gap-5">
        <div>
          {/* FOH tabs */}
          <div className="flex gap-1 p-0.5 bg-card-hi border border-border rounded-md w-fit mb-4">
            {fohWarehouses.map((w) => {
              const isActive = w.id === activeWarehouseId;
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setActiveWarehouseId(w.id)}
                  className={cn(
                    'px-3.5 py-1.5 text-[13px] rounded-sm transition-colors flex items-center gap-2',
                    isActive
                      ? 'bg-card text-text font-medium'
                      : 'text-muted hover:text-text',
                  )}
                >
                  <span
                    style={{ background: w.color }}
                    className="size-2 rounded-full shrink-0"
                  />
                  {w.name}
                </button>
              );
            })}
          </div>

          {activeArticles.isPending ? (
            <div className="flex items-center justify-center py-10">
              <Spinner />
            </div>
          ) : !activeArticles.data || activeArticles.data.items.length === 0 ? (
            <Card padding="lg">
              <p className="text-2xs text-muted m-0 text-center py-6">
                U ovom FOH skladištu nema artikala s pozitivnom zalihom.
              </p>
            </Card>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden bg-card">
              <div className="grid grid-cols-[1fr_120px_220px] px-4 py-2.5 border-b border-border bg-card-hi text-[11px] font-medium text-muted uppercase tracking-wider">
                <div>Artikl</div>
                <div className="text-right">Dostupno</div>
                <div className="text-right">Prodano</div>
              </div>
              {activeArticles.data.items.map((a, ri, arr) => {
                const qty = getQty(a.articleId, activeWarehouseId);
                const numericQty = Number(normalizeDecimal(qty)) || 0;
                const exceeds = numericQty > Number(a.quantity);
                return (
                  <div
                    key={a.articleId}
                    className={cn(
                      'grid grid-cols-[1fr_120px_220px] px-4 py-2.5 text-[13px] items-center',
                      ri < arr.length - 1 && 'border-b border-border',
                    )}
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">{a.name}</div>
                      <div className="text-2xs text-muted truncate font-mono">{a.sku}</div>
                    </div>
                    <div className="text-right text-muted">
                      {formatQuantity(a.quantity, a.unit)} {UNIT_LABELS_HR[a.unit]}
                    </div>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => adjustQty(a.articleId, activeWarehouseId, -1)}
                        disabled={numericQty <= 0}
                        className="size-7 rounded-sm bg-card-hi border border-border flex items-center justify-center text-text hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        inputMode="decimal"
                        value={qty}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (isValidQty(v)) setQty(a.articleId, activeWarehouseId, v);
                        }}
                        placeholder="0"
                        className={cn(
                          'w-16 text-center px-2 py-1 bg-card-hi border rounded-sm text-2xs focus:outline-none focus:ring-1 focus:ring-accent',
                          exceeds
                            ? 'border-danger text-danger'
                            : numericQty > 0
                              ? 'border-accent/40 text-accent font-medium'
                              : 'border-border text-text',
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => adjustQty(a.articleId, activeWarehouseId, 1)}
                        disabled={numericQty >= Number(a.quantity)}
                        className="size-7 rounded-sm bg-card-hi border border-border flex items-center justify-center text-text hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Card padding="lg" className="self-start">
          <SectionTitle>Sažetak</SectionTitle>
          <div className="flex flex-col gap-2.5 text-[13px]">
            {[
              ['Voditelj', user?.fullName() ?? '—'],
              [
                'Datum',
                new Date().toLocaleDateString('hr-HR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                }),
              ],
              ['Početak', new Date().toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })],
              ['Stavki s qty > 0', fmtNumber(summary.lineCount)],
              ['Ukupna količina', fmtNumber(summary.totalQty)],
              [
                'Promet (procjena)',
                <span className="font-semibold">{fmtMoney(summary.totalRevenue, currency)}</span>,
              ],
            ].map(([k, v]) => (
              <div key={String(k)} className="flex justify-between gap-3">
                <span className="text-muted">{k}</span>
                <span className="font-medium text-right">{v}</span>
              </div>
            ))}
          </div>
          <p className="text-2xs text-muted mt-3 m-0">
            Konačni promet računa backend nakon zatvaranja smjene (po stvarnim prodajnim
            cijenama).
          </p>
          {submitError && (
            <div className="mt-3 text-2xs text-danger" role="alert">
              {submitError}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
