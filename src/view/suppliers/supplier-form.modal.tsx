import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/view/common/components/modal.component';
import { Field } from '@/view/common/components/field.component';
import { Input } from '@/view/common/components/input.component';
import { Button } from '@/view/common/components/button.component';
import { Supplier } from '@/domain/suppliers';
import { useCreateSupplier, useUpdateSupplier } from './suppliers.hook';

const schema = z.object({
  name: z.string().trim().min(2, 'Naziv mora imati barem 2 znaka.'),
  contactPerson: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /.+@.+\..+/.test(v), 'Neispravan e-mail.'),
  note: z.string().trim().optional(),
});
type FormValues = z.infer<typeof schema>;

interface SupplierFormModalProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  initial?: Supplier | null;
}

export function SupplierFormModal({ open, onOpenChange, initial }: SupplierFormModalProps) {
  const isEdit = Boolean(initial);
  const create = useCreateSupplier();
  const update = useUpdateSupplier();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? '',
      contactPerson: initial?.contactPerson ?? '',
      phone: initial?.phone ?? '',
      email: initial?.email ?? '',
      note: initial?.note ?? '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: initial?.name ?? '',
        contactPerson: initial?.contactPerson ?? '',
        phone: initial?.phone ?? '',
        email: initial?.email ?? '',
        note: initial?.note ?? '',
      });
    }
  }, [open, initial, reset]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      name: values.name,
      contactPerson: values.contactPerson || null,
      phone: values.phone || null,
      email: values.email || null,
      note: values.note || null,
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
      title={isEdit ? 'Uredi dobavljača' : 'Novi dobavljač'}
      size="md"
      footer={
        <>
          <Button onClick={() => onOpenChange(false)} disabled={busy}>
            Odustani
          </Button>
          <Button variant="primary" onClick={handleSubmit(onSubmit)} loading={busy}>
            {isEdit ? 'Spremi' : 'Stvori'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
        <Field label="Naziv" error={errors.name?.message} cols={2}>
          <Input autoFocus invalid={Boolean(errors.name)} {...register('name')} />
        </Field>
        <Field label="Kontakt osoba">
          <Input {...register('contactPerson')} />
        </Field>
        <Field label="Telefon">
          <Input type="tel" {...register('phone')} />
        </Field>
        <Field label="E-mail" error={errors.email?.message} cols={2}>
          <Input type="email" invalid={Boolean(errors.email)} {...register('email')} />
        </Field>
        <Field label="Napomena" cols={2}>
          <Input {...register('note')} />
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
