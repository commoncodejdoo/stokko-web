import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/view/common/components/modal.component';
import { Field } from '@/view/common/components/field.component';
import { Input } from '@/view/common/components/input.component';
import { Button } from '@/view/common/components/button.component';
import { Warehouse, WarehouseKind } from '@/domain/warehouses';
import { useCreateWarehouse, useUpdateWarehouse } from './warehouses.hook';
import { cn } from '@/view/common/utils/cn';

const PALETTE = [
  '#2563eb', // blue
  '#0891b2', // cyan
  '#7c3aed', // violet
  '#d97706', // amber
  '#16a34a', // green
  '#dc2626', // red
  '#ea580c', // orange
  '#0d9488', // teal
];

const schema = z.object({
  name: z.string().trim().min(2, 'Naziv mora imati barem 2 znaka.'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Neispravna boja.'),
  kind: z.enum(['STORAGE', 'FOH']),
});
type FormValues = z.infer<typeof schema>;

interface WarehouseFormModalProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  initial?: Warehouse | null;
}

export function WarehouseFormModal({ open, onOpenChange, initial }: WarehouseFormModalProps) {
  const isEdit = Boolean(initial);
  const create = useCreateWarehouse();
  const update = useUpdateWarehouse();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? '',
      color: initial?.color ?? PALETTE[0],
      kind: (initial?.kind as WarehouseKind) ?? 'STORAGE',
    },
  });
  const selectedColor = watch('color');

  useEffect(() => {
    if (open) {
      reset({
        name: initial?.name ?? '',
        color: initial?.color ?? PALETTE[0],
        kind: (initial?.kind as WarehouseKind) ?? 'STORAGE',
      });
    }
  }, [open, initial, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && initial) {
        await update.mutateAsync({ id: initial.id, payload: values });
      } else {
        await create.mutateAsync(values);
      }
      onOpenChange(false);
    } catch {
      // error rendered inline below
    }
  };

  const error = (create.error ?? update.error) as Error | null;
  const busy = create.isPending || update.isPending;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Uredi skladište' : 'Novo skladište'}
      description="Skladišta služe za praćenje zaliha po lokaciji."
      size="md"
      footer={
        <>
          <Button onClick={() => onOpenChange(false)} disabled={busy}>
            Odustani
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            loading={busy}
          >
            {isEdit ? 'Spremi' : 'Stvori'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
        <Field label="Naziv" error={errors.name?.message}>
          <Input autoFocus invalid={Boolean(errors.name)} {...register('name')} />
        </Field>

        <Field label="Boja">
          <div className="flex flex-wrap gap-2">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setValue('color', c, { shouldDirty: true })}
                style={{ background: c }}
                className={cn(
                  'size-7 rounded-md border-2 transition-all',
                  selectedColor === c ? 'border-text scale-110' : 'border-transparent',
                )}
                aria-label={`Odaberi boju ${c}`}
              />
            ))}
          </div>
        </Field>

        <Field label="Tip skladišta" hint="STORAGE = back-of-house (kuhinja, podrum). FOH = front-of-house (sala, bar).">
          <div className="flex gap-2">
            {(['STORAGE', 'FOH'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setValue('kind', k, { shouldDirty: true })}
                className={cn(
                  'px-3 py-1.5 text-[13px] rounded-md border transition-colors',
                  watch('kind') === k
                    ? 'bg-accent-soft text-accent border-accent/30'
                    : 'bg-card-hi text-text border-border',
                )}
              >
                {k === 'STORAGE' ? 'BOH (skladište)' : 'FOH (prodajno mjesto)'}
              </button>
            ))}
          </div>
        </Field>

        {error && (
          <div className="text-2xs text-danger" role="alert">
            {error.message}
          </div>
        )}
      </form>
    </Modal>
  );
}
