import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/view/common/components/page-header.component';
import { Button } from '@/view/common/components/button.component';
import { Card } from '@/view/common/components/card.component';
import { Field } from '@/view/common/components/field.component';
import { Input } from '@/view/common/components/input.component';
import { SectionTitle } from '@/view/common/components/section-title.component';
import { Spinner } from '@/view/common/components/spinner.component';
import { Pill } from '@/view/common/components/pill.component';
import { Table } from '@/view/common/components/table.component';
import { useWarehouses } from '@/view/warehouses/warehouses.hook';
import { useSuppliers } from '@/view/suppliers/suppliers.hook';
import { useArticles } from '@/view/articles/articles.hook';
import { useAuthStore } from '@/view/common/store/auth-store';
import { fmtMoney } from '@/view/common/utils/format';
import { cn } from '@/view/common/utils/cn';
import { useCreateProcurement } from './procurements.hook';

interface DraftItem {
  articleId: string;
  quantity: string;
  purchasePrice: string;
}

const STEPS = ['Skladište & dobavljač', 'Artikli', 'Potvrda'];

const normalizeDecimal = (s: string) => s.replace(',', '.').trim();
const isPositive = (s: string) => /^\d+(\.\d+)?$/.test(normalizeDecimal(s)) && Number(s) > 0;

export function NovaPrimkaScreen() {
  const navigate = useNavigate();
  const organization = useAuthStore((s) => s.organization);
  const currency = organization?.currency ?? 'EUR';

  const warehouses = useWarehouses();
  const suppliers = useSuppliers();
  const articles = useArticles();
  const createProcurement = useCreateProcurement();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [warehouseId, setWarehouseId] = useState('');
  const [supplierId, setSupplierId] = useState<string | ''>('');
  const [note, setNote] = useState('');
  const [items, setItems] = useState<DraftItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const totalValue = useMemo(
    () =>
      items.reduce((sum, i) => {
        const q = Number(normalizeDecimal(i.quantity)) || 0;
        const p = Number(normalizeDecimal(i.purchasePrice)) || 0;
        return sum + q * p;
      }, 0),
    [items],
  );

  const canNextFromStep1 = warehouseId.trim().length > 0;
  const canNextFromStep2 =
    items.length > 0 &&
    items.every(
      (i) => i.articleId && isPositive(i.quantity) && isPositive(i.purchasePrice),
    );

  const addItem = () => {
    setItems((prev) => [...prev, { articleId: '', quantity: '', purchasePrice: '' }]);
  };

  const updateItem = (index: number, patch: Partial<DraftItem>) => {
    setItems((prev) => prev.map((i, idx) => (idx === index ? { ...i, ...patch } : i)));
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      const payload = {
        warehouseId,
        supplierId: supplierId ? supplierId : null,
        note: note.trim() || undefined,
        items: items.map((i) => ({
          articleId: i.articleId,
          quantity: normalizeDecimal(i.quantity),
          purchasePrice: normalizeDecimal(i.purchasePrice),
        })),
      };
      const result = await createProcurement.mutateAsync(payload);
      navigate(`/primke/${result.id}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri spremanju nabave.');
    }
  };

  if (warehouses.isPending || suppliers.isPending || articles.isPending) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Nova nabava"
        breadcrumb={
          <>
            <a
              onClick={() => navigate('/primke')}
              className="hover:text-text cursor-pointer"
            >
              Nabave
            </a>{' '}
            / Nova
          </>
        }
        actions={
          <Button onClick={() => navigate('/primke')} disabled={createProcurement.isPending}>
            Odustani
          </Button>
        }
      />

      <div className="px-8 py-6 max-w-[1200px]">
        {/* Stepper */}
        <div className="flex items-center gap-3 mb-6">
          {STEPS.map((label, i) => {
            const stepNumber = i + 1;
            const reached = stepNumber <= step;
            const completed = stepNumber < step;
            return (
              <div key={label} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => stepNumber < step && setStep(stepNumber as 1 | 2 | 3)}
                  className="flex items-center gap-2 bg-transparent border-none cursor-pointer"
                >
                  <div
                    className={cn(
                      'size-6 rounded-full flex items-center justify-center text-[12px] font-semibold border',
                      reached
                        ? 'bg-accent text-white border-accent'
                        : 'bg-card-hi text-muted border-border',
                    )}
                  >
                    {completed ? <Check size={12} strokeWidth={3} /> : stepNumber}
                  </div>
                  <span
                    className={cn(
                      'text-[13px]',
                      stepNumber === step
                        ? 'text-text font-medium'
                        : reached
                          ? 'text-text'
                          : 'text-muted',
                    )}
                  >
                    {label}
                  </span>
                </button>
                {i < STEPS.length - 1 && <div className="w-12 h-px bg-border" />}
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <Card padding="lg">
          {step === 1 && (
            <div className="grid grid-cols-2 gap-4 max-w-[720px]">
              <Field label="Skladište">
                <select
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  className="w-full px-3 py-2 bg-card-hi border border-border rounded-md text-text text-[13px] focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="">— Odaberi —</option>
                  {warehouses.data?.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Dobavljač (opcionalno)">
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full px-3 py-2 bg-card-hi border border-border rounded-md text-text text-[13px] focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="">— Bez dobavljača —</option>
                  {suppliers.data?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Napomena" cols={2}>
                <Input
                  placeholder="npr. broj računa, dodatne info…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <SectionTitle>Stavke ({items.length})</SectionTitle>
                <Button
                  variant="primary"
                  icon={<Plus size={14} />}
                  onClick={addItem}
                  disabled={!articles.data || articles.data.length === 0}
                >
                  Dodaj stavku
                </Button>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-10 text-2xs text-muted border border-dashed border-border rounded-md">
                  Još nema stavki. Klikni „Dodaj stavku" da započneš.
                </div>
              ) : (
                <Table
                  cols={[
                    {
                      key: 'article',
                      label: 'Artikl',
                      render: (_, idx) => (
                        <select
                          value={items[idx].articleId}
                          onChange={(e) => updateItem(idx, { articleId: e.target.value })}
                          className="w-full px-2 py-1 bg-card-hi border border-border rounded-sm text-text text-2xs focus:outline-none focus:ring-1 focus:ring-accent"
                        >
                          <option value="">— Odaberi artikl —</option>
                          {articles.data?.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name} ({a.sku})
                            </option>
                          ))}
                        </select>
                      ),
                    },
                    {
                      key: 'qty',
                      label: 'Količina',
                      width: '110px',
                      align: 'right',
                      render: (_, idx) => (
                        <input
                          inputMode="decimal"
                          value={items[idx].quantity}
                          onChange={(e) => updateItem(idx, { quantity: e.target.value })}
                          className="w-full px-2 py-1 bg-card-hi border border-border rounded-sm text-text text-2xs text-right focus:outline-none focus:ring-1 focus:ring-accent"
                          placeholder="0"
                        />
                      ),
                    },
                    {
                      key: 'price',
                      label: 'Cijena',
                      width: '130px',
                      align: 'right',
                      render: (_, idx) => (
                        <input
                          inputMode="decimal"
                          value={items[idx].purchasePrice}
                          onChange={(e) => updateItem(idx, { purchasePrice: e.target.value })}
                          className="w-full px-2 py-1 bg-card-hi border border-border rounded-sm text-text text-2xs text-right focus:outline-none focus:ring-1 focus:ring-accent"
                          placeholder="0.00"
                        />
                      ),
                    },
                    {
                      key: 'total',
                      label: 'Ukupno',
                      width: '130px',
                      align: 'right',
                      render: (_, idx) => {
                        const i = items[idx];
                        const q = Number(normalizeDecimal(i.quantity)) || 0;
                        const p = Number(normalizeDecimal(i.purchasePrice)) || 0;
                        return (
                          <span className="font-medium tabular-nums">
                            {fmtMoney(q * p, currency)}
                          </span>
                        );
                      },
                    },
                    {
                      key: 'remove',
                      label: '',
                      width: '40px',
                      align: 'right',
                      render: (_, idx) => (
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="text-muted hover:text-danger p-1"
                          aria-label="Ukloni stavku"
                        >
                          <Trash2 size={14} />
                        </button>
                      ),
                    },
                  ]}
                  rows={items.map((_, i) => i)}
                  rowKey={(_, i) => `item-${i}`}
                />
              )}
              <div className="mt-4 flex justify-end gap-6 text-[13px]">
                <span className="text-muted">
                  Ukupno:{' '}
                  <span className="text-text font-semibold text-[15px]">
                    {fmtMoney(totalValue, currency)}
                  </span>
                </span>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-10">
              <div className="size-12 rounded-full bg-accent-soft text-accent inline-flex items-center justify-center mb-4">
                <Check size={24} strokeWidth={2} />
              </div>
              <h3 className="m-0 mb-2 text-[18px] font-semibold">Spremno za evidentiranje</h3>
              <p className="m-0 text-2xs text-muted">
                {items.length} stavki · <span className="text-text font-medium">{fmtMoney(totalValue, currency)}</span>
              </p>
              <div className="mt-6 inline-flex flex-col gap-2 text-left text-[13px]">
                <div className="flex justify-between gap-6">
                  <span className="text-muted">Skladište:</span>
                  <span className="font-medium">
                    {warehouses.data?.find((w) => w.id === warehouseId)?.name ?? '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-6">
                  <span className="text-muted">Dobavljač:</span>
                  <span className="font-medium">
                    {supplierId
                      ? suppliers.data?.find((s) => s.id === supplierId)?.name ?? '—'
                      : <span className="italic text-muted">Bez dobavljača</span>}
                  </span>
                </div>
                {note && (
                  <div className="flex justify-between gap-6 max-w-md">
                    <span className="text-muted">Napomena:</span>
                    <span className="font-medium text-right">{note}</span>
                  </div>
                )}
              </div>
              {error && (
                <div className="mt-4 text-2xs text-danger" role="alert">
                  {error}
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Footer nav */}
        <div className="mt-4 flex justify-between">
          <Button
            icon={<ArrowLeft size={14} />}
            onClick={() => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s))}
            disabled={step === 1 || createProcurement.isPending}
          >
            Natrag
          </Button>
          {step < 3 ? (
            <Button
              variant="primary"
              icon={<ArrowRight size={14} />}
              onClick={() => {
                if (step === 1 && !canNextFromStep1) return;
                if (step === 2 && !canNextFromStep2) return;
                setStep((s) => (s + 1) as 1 | 2 | 3);
              }}
              disabled={
                (step === 1 && !canNextFromStep1) || (step === 2 && !canNextFromStep2)
              }
            >
              Nastavi
            </Button>
          ) : (
            <Button
              variant="primary"
              icon={<Check size={14} />}
              onClick={handleSubmit}
              loading={createProcurement.isPending}
              disabled={!canNextFromStep2}
            >
              Evidentiraj nabavu
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Suppress unused import warning during the wizard render.
void Pill;
