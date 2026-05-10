import { useState } from 'react';
import { Button } from '@/view/common/components/button.component';
import { Field } from '@/view/common/components/field.component';
import { Input } from '@/view/common/components/input.component';
import { cn } from '@/view/common/utils/cn';
import { Warehouse } from '@/domain/warehouses';
import { useCreateWarehouse } from './warehouses.hook';

const PALETTE = ['#2563eb', '#0891b2', '#7c3aed', '#d97706', '#16a34a', '#dc2626'];

interface WarehouseMiniFormProps {
  onSaved(w: Warehouse): void;
  onCancel(): void;
}

/**
 * Pared-down warehouse form used inside the PickerDialog "+ Dodaj novi" flow.
 * For full edit/create with all fields, use WarehouseFormModal.
 */
export function WarehouseMiniForm({ onSaved, onCancel }: WarehouseMiniFormProps) {
  const create = useCreateWarehouse();
  const [name, setName] = useState('');
  const [color, setColor] = useState(PALETTE[0]);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    if (name.trim().length < 2) {
      setErr('Naziv mora imati barem 2 znaka.');
      return;
    }
    try {
      const w = await create.mutateAsync({ name: name.trim(), color, kind: 'STORAGE' });
      onSaved(w);
    } catch (error) {
      setErr((error as Error).message);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Field label="Naziv skladišta" error={err ?? undefined}>
        <Input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="npr. Glavno skladište"
        />
      </Field>
      <Field label="Boja">
        <div className="flex gap-2">
          {PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              style={{ background: c }}
              className={cn(
                'size-7 rounded-md border-2 transition-all',
                color === c ? 'border-text scale-110' : 'border-transparent',
              )}
              aria-label={`Odaberi boju ${c}`}
            />
          ))}
        </div>
      </Field>
      <div className="flex justify-end gap-2 pt-2">
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
