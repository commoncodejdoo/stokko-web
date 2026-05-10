import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { PageHeader } from '@/view/common/components/page-header.component';
import { Button } from '@/view/common/components/button.component';
import { Card } from '@/view/common/components/card.component';
import { Field } from '@/view/common/components/field.component';
import { Input } from '@/view/common/components/input.component';
import { Spinner } from '@/view/common/components/spinner.component';
import { useArticles } from '@/view/articles/articles.hook';
import { useWarehouses } from '@/view/warehouses/warehouses.hook';
import {
  ALL_CORRECTION_REASONS,
  CORRECTION_REASON_LABELS_HR,
  CorrectionReason,
  CorrectionType,
} from '@/domain/corrections';
import { useCreateCorrection } from './corrections.hook';
import { formatQuantity, UNIT_LABELS_HR } from '@/domain/common/unit';
import { cn } from '@/view/common/utils/cn';

const normalizeDecimal = (s: string) => s.replace(',', '.').trim();

export function CorrectionScreen() {
  const navigate = useNavigate();
  const articles = useArticles();
  const warehouses = useWarehouses();
  const createCorrection = useCreateCorrection();

  const [articleId, setArticleId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [type, setType] = useState<CorrectionType>('ABSOLUTE');
  const [value, setValue] = useState('');
  const [reason, setReason] = useState<CorrectionReason>('COUNT');
  const [note, setNote] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const article = useMemo(
    () => articles.data?.find((a) => a.id === articleId) ?? null,
    [articles.data, articleId],
  );
  const currentStock = useMemo(() => {
    if (!article || !warehouseId) return null;
    const entry = article.stockByWarehouse?.find((s) => s.warehouseId === warehouseId);
    return entry?.quantity ?? '0';
  }, [article, warehouseId]);

  const canSubmit =
    articleId &&
    warehouseId &&
    normalizeDecimal(value).length > 0 &&
    !Number.isNaN(Number(normalizeDecimal(value)));

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitError(null);
    try {
      await createCorrection.mutateAsync({
        articleId,
        warehouseId,
        type,
        value: normalizeDecimal(value),
        reason,
        note: note.trim() || undefined,
      });
      navigate(`/artikli/${articleId}`, { replace: true });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Greška pri spremanju korekcije.');
    }
  };

  if (articles.isPending || warehouses.isPending) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Korekcija zaliha"
        sub="Ručno prilagodi stanje uz razlog"
        breadcrumb="Korekcija"
        actions={
          <>
            <Button onClick={() => navigate('/')} disabled={createCorrection.isPending}>
              Odustani
            </Button>
            <Button
              variant="primary"
              icon={<Check size={14} />}
              onClick={handleSubmit}
              loading={createCorrection.isPending}
              disabled={!canSubmit}
            >
              Spremi korekciju
            </Button>
          </>
        }
      />
      <div className="px-8 py-6 max-w-[720px]">
        <Card padding="lg">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Artikl" cols={2}>
              <select
                value={articleId}
                onChange={(e) => setArticleId(e.target.value)}
                className="w-full px-3 py-2 bg-card-hi border border-border rounded-md text-text text-[13px] focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">— Odaberi artikl —</option>
                {articles.data?.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.sku})
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Skladište" cols={2}>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full px-3 py-2 bg-card-hi border border-border rounded-md text-text text-[13px] focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">— Odaberi skladište —</option>
                {warehouses.data?.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Trenutno stanje">
              <div className="px-3 py-2 bg-card-hi border border-border rounded-md text-[13px] font-medium">
                {currentStock !== null && article
                  ? `${formatQuantity(currentStock, article.unit)} ${UNIT_LABELS_HR[article.unit]}`
                  : '—'}
              </div>
            </Field>

            <Field label="Tip korekcije">
              <div className="flex gap-2">
                {(['ABSOLUTE', 'DELTA'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={cn(
                      'px-3 py-1.5 text-[13px] rounded-md border flex-1 transition-colors',
                      type === t
                        ? 'bg-accent-soft text-accent border-accent/30'
                        : 'bg-card-hi text-text border-border',
                    )}
                  >
                    {t === 'ABSOLUTE' ? 'Apsolutno' : 'Razlika (±)'}
                  </button>
                ))}
              </div>
            </Field>

            <Field
              label={type === 'ABSOLUTE' ? 'Novo stanje' : 'Razlika (+/−)'}
              hint={
                type === 'ABSOLUTE'
                  ? 'Količina koja zamjenjuje trenutno stanje.'
                  : 'Pozitivno za dodavanje, negativno za oduzimanje.'
              }
              cols={2}
            >
              <Input
                inputMode="decimal"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={type === 'ABSOLUTE' ? '0' : '+0 ili -0'}
              />
            </Field>

            <Field label="Razlog" cols={2}>
              <div className="flex flex-wrap gap-2">
                {ALL_CORRECTION_REASONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReason(r)}
                    className={cn(
                      'px-3 py-1.5 text-2xs rounded-full border transition-colors',
                      reason === r
                        ? 'bg-accent-soft text-accent border-accent/30'
                        : 'bg-card-hi text-text border-border',
                    )}
                  >
                    {CORRECTION_REASON_LABELS_HR[r]}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Napomena (opcionalno)" cols={2}>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Detalji koji opravdavaju korekciju"
              />
            </Field>

            {submitError && (
              <div className="col-span-2 text-2xs text-danger" role="alert">
                {submitError}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
