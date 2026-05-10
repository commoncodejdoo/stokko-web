import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check, ChevronDown, Plus, Trash2 } from 'lucide-react';
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
import { useWarehouses, useWarehouseArticles } from '@/view/warehouses/warehouses.hook';
import { useArticles } from '@/view/articles/articles.hook';
import { formatQuantity, UNIT_LABELS_HR } from '@/domain/common/unit';
import { cn } from '@/view/common/utils/cn';
import { useCreateTransfer } from './transfers.hook';

interface DraftItem {
  articleId: string;
  quantity: string;
}

const STEPS = ['Skladišta', 'Artikli', 'Potvrda'];

const normalizeDecimal = (s: string) => s.replace(',', '.').trim();
const isPositive = (s: string) => /^\d+(\.\d+)?$/.test(normalizeDecimal(s)) && Number(s) > 0;

export function PremjestajScreen() {
  const navigate = useNavigate();
  const warehouses = useWarehouses();
  const articlesAll = useArticles();
  const createTransfer = useCreateTransfer();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [sourceId, setSourceId] = useState('');
  const [destId, setDestId] = useState('');
  const [note, setNote] = useState('');
  const [items, setItems] = useState<DraftItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [sourcePicker, setSourcePicker] = useState(false);
  const [destPicker, setDestPicker] = useState(false);
  const [articlePickerForIdx, setArticlePickerForIdx] = useState<number | null>(null);

  const sourceArticles = useWarehouseArticles(sourceId || undefined);
  const sourceWarehouse = warehouses.data?.find((w) => w.id === sourceId);
  const destWarehouse = warehouses.data?.find((w) => w.id === destId);

  const availableMap = useMemo(() => {
    const map = new Map<string, { qty: string; unit: string }>();
    sourceArticles.data?.items.forEach((a) =>
      map.set(a.articleId, { qty: a.quantity, unit: a.unit }),
    );
    return map;
  }, [sourceArticles.data]);

  const articleItems: PickerItem[] = useMemo(() => {
    // Only items present in source warehouse with qty > 0
    return (
      sourceArticles.data?.items
        .filter((a) => Number(a.quantity) > 0)
        .map((a) => ({
          id: a.articleId,
          label: a.name,
          meta: a.sku,
          sublabel: `Dostupno: ${formatQuantity(a.quantity, a.unit)} ${UNIT_LABELS_HR[a.unit]}`,
        })) ?? []
    );
  }, [sourceArticles.data]);

  const warehouseItems = (excludeId: string): PickerItem[] =>
    warehouses.data
      ?.filter((w) => w.id !== excludeId)
      .map((w) => ({
        id: w.id,
        label: w.name,
        sublabel: w.kind === 'FOH' ? 'Front-of-house' : 'Skladište',
        color: w.color,
      })) ?? [];

  const canNextFromStep1 =
    sourceId && destId && sourceId !== destId;

  const canNextFromStep2 =
    items.length > 0 &&
    items.every((i) => {
      if (!i.articleId || !isPositive(i.quantity)) return false;
      const avail = availableMap.get(i.articleId);
      if (!avail) return false;
      return Number(normalizeDecimal(i.quantity)) <= Number(avail.qty);
    });

  const addItem = () => {
    setItems((prev) => [...prev, { articleId: '', quantity: '' }]);
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
      const result = await createTransfer.mutateAsync({
        sourceWarehouseId: sourceId,
        destinationWarehouseId: destId,
        note: note.trim() || undefined,
        items: items.map((i) => ({
          articleId: i.articleId,
          quantity: normalizeDecimal(i.quantity),
        })),
      });
      navigate(`/premjestaj/${result.id}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri spremanju premještaja.');
    }
  };

  if (warehouses.isPending || articlesAll.isPending) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Premještaj robe"
        breadcrumb="Premještaj"
        actions={
          <Button onClick={() => navigate('/')} disabled={createTransfer.isPending}>
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

        <Card padding="lg">
          {step === 1 && (
            <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-end max-w-[760px]">
              <Field label="Iz skladišta">
                <PickerTrigger
                  onClick={() => setSourcePicker(true)}
                  placeholder="Odaberi izvor"
                >
                  {sourceWarehouse && (
                    <>
                      <span
                        style={{ background: sourceWarehouse.color }}
                        className="size-2.5 rounded-full shrink-0"
                      />
                      <span className="truncate">{sourceWarehouse.name}</span>
                    </>
                  )}
                </PickerTrigger>
              </Field>
              <div className="pb-2 text-accent">
                <ArrowRight size={20} />
              </div>
              <Field label="U skladište">
                <PickerTrigger
                  onClick={() => setDestPicker(true)}
                  placeholder="Odaberi odredište"
                >
                  {destWarehouse && (
                    <>
                      <span
                        style={{ background: destWarehouse.color }}
                        className="size-2.5 rounded-full shrink-0"
                      />
                      <span className="truncate">{destWarehouse.name}</span>
                    </>
                  )}
                </PickerTrigger>
              </Field>
              <div className="col-span-3 max-w-[480px]">
                <Field label="Napomena (opcionalno)">
                  <Input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Razlog premještaja…"
                  />
                </Field>
              </div>
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
                  disabled={!articleItems.length}
                >
                  Dodaj stavku
                </Button>
              </div>

              {sourceArticles.isPending ? (
                <div className="flex items-center justify-center py-10">
                  <Spinner />
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-10 text-2xs text-muted border border-dashed border-border rounded-md">
                  {articleItems.length === 0
                    ? 'U izvornom skladištu nema artikala s pozitivnom zalihom.'
                    : 'Klikni „Dodaj stavku" za odabir artikla.'}
                </div>
              ) : (
                <Table
                  cols={[
                    {
                      key: 'article',
                      label: 'Artikl',
                      render: (_, idx) => {
                        const it = items[idx];
                        const article = articlesAll.data?.find((a) => a.id === it.articleId);
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
                      key: 'available',
                      label: 'Dostupno',
                      width: '120px',
                      align: 'right',
                      muted: true,
                      render: (_, idx) => {
                        const it = items[idx];
                        const avail = availableMap.get(it.articleId);
                        if (!avail) return '—';
                        return `${formatQuantity(avail.qty, avail.unit as never)} ${UNIT_LABELS_HR[avail.unit as keyof typeof UNIT_LABELS_HR] ?? ''}`;
                      },
                    },
                    {
                      key: 'qty',
                      label: 'Premjesti',
                      width: '120px',
                      align: 'right',
                      render: (_, idx) => {
                        const it = items[idx];
                        const avail = availableMap.get(it.articleId);
                        const exceeds =
                          avail && it.quantity
                            ? Number(normalizeDecimal(it.quantity)) > Number(avail.qty)
                            : false;
                        return (
                          <input
                            inputMode="decimal"
                            value={it.quantity}
                            onChange={(e) => updateItem(idx, { quantity: e.target.value })}
                            className={cn(
                              'w-full px-2 py-1 bg-card-hi border rounded-sm text-2xs text-right focus:outline-none focus:ring-1 focus:ring-accent',
                              exceeds ? 'border-danger text-danger' : 'border-border text-text',
                            )}
                            placeholder="0"
                          />
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
                  rowKey={(_, i) => `row-${i}`}
                />
              )}
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-10">
              <div className="size-12 rounded-full bg-accent-soft text-accent inline-flex items-center justify-center mb-4">
                <Check size={24} strokeWidth={2} />
              </div>
              <h3 className="m-0 mb-2 text-[18px] font-semibold">Spremno za premještaj</h3>
              <p className="m-0 text-2xs text-muted">
                {items.length} stavki ·{' '}
                <span className="text-text font-medium">
                  {sourceWarehouse?.name}
                </span>{' '}
                →{' '}
                <span className="text-text font-medium">{destWarehouse?.name}</span>
              </p>
              {note && (
                <p className="m-0 mt-3 text-2xs text-muted max-w-md mx-auto">{note}</p>
              )}
              {error && (
                <div className="mt-4 text-2xs text-danger" role="alert">
                  {error}
                </div>
              )}
            </div>
          )}
        </Card>

        <div className="mt-4 flex justify-between">
          <Button
            icon={<ArrowLeft size={14} />}
            onClick={() => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s))}
            disabled={step === 1 || createTransfer.isPending}
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
              loading={createTransfer.isPending}
              disabled={!canNextFromStep2}
            >
              Potvrdi premještaj
            </Button>
          )}
        </div>
      </div>

      {/* Pickers */}
      <PickerDialog
        open={sourcePicker}
        onOpenChange={setSourcePicker}
        title="Iz skladišta"
        items={warehouseItems(destId)}
        selectedId={sourceId}
        onSelect={(item) => {
          setSourceId(item.id);
          setItems([]); // reset items because available stock changes
        }}
        searchPlaceholder="Pretraži skladišta…"
      />
      <PickerDialog
        open={destPicker}
        onOpenChange={setDestPicker}
        title="U skladište"
        items={warehouseItems(sourceId)}
        selectedId={destId}
        onSelect={(item) => setDestId(item.id)}
        searchPlaceholder="Pretraži skladišta…"
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
            updateItem(articlePickerForIdx, { articleId: item.id });
          }
        }}
        searchPlaceholder="Pretraži po nazivu ili SKU…"
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
