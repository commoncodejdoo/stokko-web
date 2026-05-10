import { useState } from 'react';
import { Button } from '@/view/common/components/button.component';
import { Field } from '@/view/common/components/field.component';
import { Input } from '@/view/common/components/input.component';
import { Article } from '@/domain/articles';
import { ALL_UNITS, UNIT_LABELS_HR, Unit } from '@/domain/common/unit';
import { useCategories } from '@/view/categories/categories.hook';
import { useCreateArticle } from './articles.hook';

const normalizeDecimal = (s: string) => s.replace(',', '.').trim();

interface ArticleMiniFormProps {
  onSaved(a: Article): void;
  onCancel(): void;
}

/**
 * Minimal article form for inline create in pickers. Skips full thresholds /
 * sale price — those default to sensible values that can be edited later.
 */
export function ArticleMiniForm({ onSaved, onCancel }: ArticleMiniFormProps) {
  const create = useCreateArticle();
  const categories = useCategories();
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState<Unit>('KOM');
  const [categoryId, setCategoryId] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('0.00');
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    if (sku.trim().length < 1) {
      setErr('SKU je obavezan.');
      return;
    }
    if (name.trim().length < 2) {
      setErr('Naziv mora imati barem 2 znaka.');
      return;
    }
    if (!categoryId) {
      setErr('Odaberi kategoriju.');
      return;
    }
    try {
      const a = await create.mutateAsync({
        sku: sku.trim(),
        name: name.trim(),
        unit,
        categoryId,
        purchasePrice: normalizeDecimal(purchasePrice),
        salePrice: normalizeDecimal(purchasePrice),
        thresholdWarning: '0',
        thresholdCritical: '0',
      });
      onSaved(a);
    } catch (error) {
      setErr((error as Error).message);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label="SKU">
        <Input
          autoFocus
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          placeholder="ME-001"
        />
      </Field>
      <Field label="Mjerna jedinica">
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value as Unit)}
          className="w-full px-3 py-2 bg-card-hi border border-border rounded-md text-text text-[13px] focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {ALL_UNITS.map((u) => (
            <option key={u} value={u}>
              {UNIT_LABELS_HR[u]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Naziv" cols={2}>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Kategorija">
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full px-3 py-2 bg-card-hi border border-border rounded-md text-text text-[13px] focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="">— Odaberi —</option>
          {categories.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Nabavna cijena">
        <Input
          inputMode="decimal"
          value={purchasePrice}
          onChange={(e) => setPurchasePrice(e.target.value)}
        />
      </Field>
      {err && (
        <div className="col-span-2 text-2xs text-danger" role="alert">
          {err}
        </div>
      )}
      <div className="col-span-2 flex justify-end gap-2 pt-2">
        <Button onClick={onCancel} disabled={create.isPending}>
          Natrag
        </Button>
        <Button variant="primary" onClick={submit} loading={create.isPending}>
          Stvori i odaberi
        </Button>
      </div>
    </div>
  );
}
