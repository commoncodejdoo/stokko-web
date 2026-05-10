import { useState } from 'react';
import { Button } from '@/view/common/components/button.component';
import { Field } from '@/view/common/components/field.component';
import { Input } from '@/view/common/components/input.component';
import { Supplier } from '@/domain/suppliers';
import { useCreateSupplier } from './suppliers.hook';

interface SupplierMiniFormProps {
  onSaved(s: Supplier): void;
  onCancel(): void;
}

export function SupplierMiniForm({ onSaved, onCancel }: SupplierMiniFormProps) {
  const create = useCreateSupplier();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    if (name.trim().length < 2) {
      setErr('Naziv mora imati barem 2 znaka.');
      return;
    }
    try {
      const s = await create.mutateAsync({
        name: name.trim(),
        phone: phone.trim() || null,
      });
      onSaved(s);
    } catch (error) {
      setErr((error as Error).message);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Field label="Naziv dobavljača" error={err ?? undefined}>
        <Input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="npr. Coca-Cola HBC d.o.o."
        />
      </Field>
      <Field label="Telefon (opcionalno)">
        <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
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
