import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/view/common/components/modal.component';
import { Field } from '@/view/common/components/field.component';
import { Input } from '@/view/common/components/input.component';
import { Button } from '@/view/common/components/button.component';
import { Article } from '@/domain/articles';
import { ALL_UNITS, UNIT_LABELS_HR } from '@/domain/common/unit';
import { useCategories } from '@/view/categories/categories.hook';
import { useSuppliers } from '@/view/suppliers/suppliers.hook';
import { useCreateArticle, useUpdateArticle } from './articles.hook';

const decimalString = z.string().regex(/^\d+(\.\d+)?$/, 'Mora biti pozitivan broj.');

const schema = z.object({
  sku: z.string().trim().min(1, 'SKU je obavezan.'),
  name: z.string().trim().min(2, 'Naziv mora imati barem 2 znaka.'),
  unit: z.enum(['KOM', 'KG', 'L', 'BOCA', 'GAJBA', 'PAKET', 'KUTIJA']),
  categoryId: z.string().min(1, 'Odaberi kategoriju.'),
  supplierId: z.string().optional(),
  purchasePrice: decimalString,
  salePrice: decimalString,
  thresholdWarning: decimalString,
  thresholdCritical: decimalString,
});
type FormValues = z.infer<typeof schema>;

interface ArticleFormModalProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  initial?: Article | null;
}

const normalizeDecimal = (s: string) => s.replace(',', '.').trim();

export function ArticleFormModal({ open, onOpenChange, initial }: ArticleFormModalProps) {
  const isEdit = Boolean(initial);
  const create = useCreateArticle();
  const update = useUpdateArticle();
  const categories = useCategories();
  const suppliers = useSuppliers();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      sku: initial?.sku ?? '',
      name: initial?.name ?? '',
      unit: initial?.unit ?? 'KOM',
      categoryId: initial?.categoryId ?? '',
      supplierId: initial?.supplierId ?? '',
      purchasePrice: initial?.purchasePrice ?? '0.00',
      salePrice: initial?.salePrice ?? '0.00',
      thresholdWarning: initial?.thresholdWarning ?? '0',
      thresholdCritical: initial?.thresholdCritical ?? '0',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        sku: initial?.sku ?? '',
        name: initial?.name ?? '',
        unit: initial?.unit ?? 'KOM',
        categoryId: initial?.categoryId ?? '',
        supplierId: initial?.supplierId ?? '',
        purchasePrice: initial?.purchasePrice ?? '0.00',
        salePrice: initial?.salePrice ?? '0.00',
        thresholdWarning: initial?.thresholdWarning ?? '0',
        thresholdCritical: initial?.thresholdCritical ?? '0',
      });
    }
  }, [open, initial, reset]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      sku: values.sku,
      name: values.name,
      unit: values.unit,
      categoryId: values.categoryId,
      supplierId: values.supplierId ? values.supplierId : null,
      purchasePrice: normalizeDecimal(values.purchasePrice),
      salePrice: normalizeDecimal(values.salePrice),
      thresholdWarning: normalizeDecimal(values.thresholdWarning),
      thresholdCritical: normalizeDecimal(values.thresholdCritical),
    };
    try {
      if (isEdit && initial) {
        await update.mutateAsync({ id: initial.id, payload });
      } else {
        await create.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch {
      // error rendered inline
    }
  };

  const error = (create.error ?? update.error) as Error | null;
  const busy = create.isPending || update.isPending;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Uredi artikl' : 'Novi artikl'}
      size="lg"
      footer={
        <>
          <Button onClick={() => onOpenChange(false)} disabled={busy}>
            Odustani
          </Button>
          <Button variant="primary" onClick={handleSubmit(onSubmit)} loading={busy}>
            {isEdit ? 'Spremi' : 'Stvori artikl'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
        <Field label="SKU / Šifra" error={errors.sku?.message}>
          <Input autoFocus invalid={Boolean(errors.sku)} {...register('sku')} />
        </Field>
        <Field label="Mjerna jedinica" error={errors.unit?.message}>
          <Controller
            name="unit"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="w-full px-3 py-2 bg-card-hi border border-border rounded-md text-text text-[13px] focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {ALL_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {UNIT_LABELS_HR[u]}
                  </option>
                ))}
              </select>
            )}
          />
        </Field>
        <Field label="Naziv" error={errors.name?.message} cols={2}>
          <Input invalid={Boolean(errors.name)} {...register('name')} />
        </Field>
        <Field label="Kategorija" error={errors.categoryId?.message}>
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="w-full px-3 py-2 bg-card-hi border border-border rounded-md text-text text-[13px] focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">— Odaberi —</option>
                {categories.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          />
        </Field>
        <Field label="Dobavljač (opcionalno)">
          <Controller
            name="supplierId"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="w-full px-3 py-2 bg-card-hi border border-border rounded-md text-text text-[13px] focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">— Bez dobavljača —</option>
                {suppliers.data?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
          />
        </Field>
        <Field label="Nabavna cijena" error={errors.purchasePrice?.message}>
          <Input
            inputMode="decimal"
            invalid={Boolean(errors.purchasePrice)}
            {...register('purchasePrice')}
          />
        </Field>
        <Field label="Prodajna cijena" error={errors.salePrice?.message}>
          <Input
            inputMode="decimal"
            invalid={Boolean(errors.salePrice)}
            {...register('salePrice')}
          />
        </Field>
        <Field
          label="Prag upozorenja"
          hint="Ispod ove količine artikl je u 'Upozorenje' statusu."
          error={errors.thresholdWarning?.message}
        >
          <Input
            inputMode="decimal"
            invalid={Boolean(errors.thresholdWarning)}
            {...register('thresholdWarning')}
          />
        </Field>
        <Field
          label="Kritični prag"
          hint="Ispod ove količine artikl je 'Kritično'."
          error={errors.thresholdCritical?.message}
        >
          <Input
            inputMode="decimal"
            invalid={Boolean(errors.thresholdCritical)}
            {...register('thresholdCritical')}
          />
        </Field>
        {error && (
          <div className="col-span-2 text-2xs text-danger" role="alert">
            {error.message}
          </div>
        )}
      </form>
    </Modal>
  );
}
