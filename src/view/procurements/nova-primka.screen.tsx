import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/view/common/components/page-header.component';
import { Button } from '@/view/common/components/button.component';
import { Card } from '@/view/common/components/card.component';
import { Field } from '@/view/common/components/field.component';
import { Input } from '@/view/common/components/input.component';
import { SectionTitle } from '@/view/common/components/section-title.component';
import { Spinner } from '@/view/common/components/spinner.component';
import { Table } from '@/view/common/components/table.component';
import {
  PickerDialog,
  PickerItem,
} from '@/view/common/components/picker-dialog.component';
import { useWarehouses } from '@/view/warehouses/warehouses.hook';
import { useSuppliers } from '@/view/suppliers/suppliers.hook';
import { useArticles } from '@/view/articles/articles.hook';
import { WarehouseMiniForm } from '@/view/warehouses/warehouse-mini-form.component';
import { SupplierMiniForm } from '@/view/suppliers/supplier-mini-form.component';
import { ArticleMiniForm } from '@/view/articles/article-mini-form.component';
import { useAuthStore } from '@/view/common/store/auth-store';
import { canEditCatalog } from '@/domain/common/role';
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
  const role = useAuthStore((s) => s.user?.role);
  const canAddNew = role ? canEditCatalog(role) : false;
  const currency = organization?.currency ?? 'EUR';

  const warehouses = useWarehouses();
  const suppliers = useSuppliers();
  const articles = useArticles();
  const createProcurement = useCreateProcurement();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [warehouseId, setWarehouseId] = useState('');
  const [supplierId, setSupplierId] = useState<string | null>('');
  const [note, setNote] = useState('');
  const [items, setItems] = useState<DraftItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [warehousePicker, setWarehousePicker] = useState(false);
  const [supplierPicker, setSupplierPicker] = useState(false);
  const [articlePickerForIdx, setArticlePickerForIdx] = useState<number | null>(null);

  const selectedWarehouse = warehouses.data?.find((w) => w.id === warehouseId);
  const selectedSupplier = supplierId ? suppliers.data?.find((s) => s.id === supplierId) : null;

  const warehouseItems: PickerItem[] = useMemo(
    () =>
      warehouses.data?.map((w) => ({
        id: w.id,
        label: w.name,
        sublabel: w.kind === 'FOH' ? 'Front-of-house' : 'Skladište',
        color: w.color,
      })) ?? [],
    [warehouses.data],
  );
  const supplierItems: PickerItem[] = useMemo(
    () =>
      suppliers.data?.map((s) => ({
        id: s.id,
        label: s.name,
        sublabel: s.contactPerson ?? s.email ?? undefined,
      })) ?? [],
    [suppliers.data],
  );
  const articleItems: PickerItem[] = useMemo(
    () =>
      articles.data?.map((a) => ({
        id: a.id,
        label: a.name,
        meta: a.sku,
      })) ?? [],
    [articles.data],
  );

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
                <PickerTrigger
                  onClick={() => setWarehousePicker(true)}
                  placeholder="Odaberi skladište"
                >
                  {selectedWarehouse && (
                    <>
                      <span
                        style={{ background: selectedWarehouse.color }}
                        className="size-2.5 rounded-full shrink-0"
                      />
                      <span className="truncate">{selectedWarehouse.name}</span>
                    </>
                  )}
                </PickerTrigger>
              </Field>
              <Field label="Dobavljač">
                <PickerTrigger
                  onClick={() => setSupplierPicker(true)}
                  placeholder="Bez dobavljača"
                >
                  {selectedSupplier ? (
                    <span className="truncate">{selectedSupplier.name}</span>
                  ) : supplierId === null ? (
                    <span className="italic text-muted">Bez dobavljača</span>
                  ) : null}
                </PickerTrigger>
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
                      render: (_, idx) => {
                        const article = articles.data?.find(
                          (a) => a.id === items[idx].articleId,
                        );
                        return (
                          <button
                            type="button"
                            onClick={() => setArticlePickerForIdx(idx)}
                            className={cn(
                              'w-full text-left px-2 py-1 bg-card-hi border border-border rounded-sm text-2xs flex items-center gap-2 hover:border-accent transition-colors',
                              article ? 'text-text' : 'text-muted',
                            )}
                          >
                            {article ? (
                              <>
                                <span className="font-mono text-2xs text-muted shrink-0">
                                  {article.sku}
                                </span>
                                <span className="truncate">{article.name}</span>
                              </>
                            ) : (
                              <span>— Odaberi artikl —</span>
                            )}
                            <ChevronDown size={12} className="ml-auto text-muted shrink-0" />
                          </button>
                        );
                      },
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
                {items.length} stavki ·{' '}
                <span className="text-text font-medium">{fmtMoney(totalValue, currency)}</span>
              </p>
              <div className="mt-6 inline-flex flex-col gap-2 text-left text-[13px]">
                <div className="flex justify-between gap-6">
                  <span className="text-muted">Skladište:</span>
                  <span className="font-medium">{selectedWarehouse?.name ?? '—'}</span>
                </div>
                <div className="flex justify-between gap-6">
                  <span className="text-muted">Dobavljač:</span>
                  <span className="font-medium">
                    {selectedSupplier ? (
                      selectedSupplier.name
                    ) : (
                      <span className="italic text-muted">Bez dobavljača</span>
                    )}
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

      {/* Pickers */}
      <PickerDialog
        open={warehousePicker}
        onOpenChange={setWarehousePicker}
        title="Odaberi skladište"
        items={warehouseItems}
        selectedId={warehouseId}
        onSelect={(item) => setWarehouseId(item.id)}
        searchPlaceholder="Pretraži skladišta…"
        addNewLabel="Dodaj novo skladište"
        canAddNew={canAddNew}
        renderCreateForm={(close) => (
          <WarehouseMiniForm
            onSaved={(w) => {
              setWarehouseId(w.id);
              setWarehousePicker(false);
              close();
            }}
            onCancel={close}
          />
        )}
      />

      <PickerDialog
        open={supplierPicker}
        onOpenChange={setSupplierPicker}
        title="Odaberi dobavljača"
        items={supplierItems}
        selectedId={supplierId}
        onSelect={(item) => setSupplierId(item.id)}
        searchPlaceholder="Pretraži dobavljače…"
        nullOptionLabel="Bez dobavljača"
        onSelectNull={() => setSupplierId(null)}
        addNewLabel="Dodaj novog dobavljača"
        canAddNew={canAddNew}
        renderCreateForm={(close) => (
          <SupplierMiniForm
            onSaved={(s) => {
              setSupplierId(s.id);
              setSupplierPicker(false);
              close();
            }}
            onCancel={close}
          />
        )}
      />

      <PickerDialog
        open={articlePickerForIdx !== null}
        onOpenChange={(open) => !open && setArticlePickerForIdx(null)}
        title="Odaberi artikl"
        items={articleItems}
        selectedId={
          articlePickerForIdx !== null ? items[articlePickerForIdx]?.articleId : undefined
        }
        onSelect={(item) => {
          if (articlePickerForIdx !== null) {
            const article = articles.data?.find((a) => a.id === item.id);
            updateItem(articlePickerForIdx, {
              articleId: item.id,
              purchasePrice: article?.purchasePrice ?? '0.00',
            });
          }
        }}
        searchPlaceholder="Pretraži po nazivu ili SKU…"
        addNewLabel="Dodaj novi artikl"
        canAddNew={canAddNew}
        renderCreateForm={(close) => (
          <ArticleMiniForm
            onSaved={(a) => {
              if (articlePickerForIdx !== null) {
                updateItem(articlePickerForIdx, {
                  articleId: a.id,
                  purchasePrice: a.purchasePrice,
                });
              }
              setArticlePickerForIdx(null);
              close();
            }}
            onCancel={close}
          />
        )}
      />
    </div>
  );
}

function PickerTrigger({
  onClick,
  placeholder,
  children,
}: {
  onClick(): void;
  placeholder: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-2 bg-card-hi border border-border rounded-md text-text text-[13px] hover:border-accent transition-colors min-h-[36px]"
    >
      {children ?? <span className="text-muted">{placeholder}</span>}
      <ChevronDown size={14} className="ml-auto text-muted shrink-0" />
    </button>
  );
}
