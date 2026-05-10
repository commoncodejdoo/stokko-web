import { useState } from 'react';
import { Plus, Edit, Trash2, X, Check } from 'lucide-react';
import { Card } from '@/view/common/components/card.component';
import { SectionTitle } from '@/view/common/components/section-title.component';
import { Pill } from '@/view/common/components/pill.component';
import { Spinner } from '@/view/common/components/spinner.component';
import { Button } from '@/view/common/components/button.component';
import { Input } from '@/view/common/components/input.component';
import { Modal } from '@/view/common/components/modal.component';
import { Category } from '@/domain/categories';
import { useAuthStore } from '@/view/common/store/auth-store';
import { canEditCatalog } from '@/domain/common/role';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from './categories.hook';

export function CategoriesPanel() {
  const role = useAuthStore((s) => s.user?.role);
  const canEdit = role ? canEditCatalog(role) : false;
  const categories = useCategories();
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const remove = useDeleteCategory();

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleting, setDeleting] = useState<Category | null>(null);

  const startEdit = (c: Category) => {
    setEditingId(c.id);
    setEditName(c.name);
  };

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    try {
      await create.mutateAsync({ name });
      setNewName('');
      setAdding(false);
    } catch {
      // toast in hook
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    const name = editName.trim();
    if (!name) return;
    try {
      await update.mutateAsync({ id: editingId, payload: { name } });
      setEditingId(null);
    } catch {
      // toast
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await remove.mutateAsync(deleting.id);
      setDeleting(null);
    } catch {
      // toast
    }
  };

  return (
    <Card padding="lg">
      <SectionTitle
        action={
          canEdit && !adding ? (
            <Button size="xs" icon={<Plus size={12} />} onClick={() => setAdding(true)}>
              Nova
            </Button>
          ) : null
        }
      >
        Kategorije
      </SectionTitle>

      {categories.isPending ? (
        <div className="flex items-center justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {adding && canEdit && (
            <div className="flex items-center gap-2 p-2 bg-card-hi border border-accent/30 rounded-md">
              <Input
                autoFocus
                placeholder="Naziv kategorije"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                  if (e.key === 'Escape') {
                    setAdding(false);
                    setNewName('');
                  }
                }}
                className="!py-1.5"
              />
              <Button
                size="xs"
                variant="primary"
                icon={<Check size={12} />}
                onClick={handleCreate}
                loading={create.isPending}
              >
                Spremi
              </Button>
              <Button
                size="xs"
                icon={<X size={12} />}
                onClick={() => {
                  setAdding(false);
                  setNewName('');
                }}
              >
                Odustani
              </Button>
            </div>
          )}

          {categories.data?.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-2 p-2 hover:bg-card-hi rounded-md transition-colors"
            >
              {editingId === c.id ? (
                <>
                  <Input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdate();
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="!py-1.5"
                  />
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="xs"
                      variant="primary"
                      icon={<Check size={12} />}
                      onClick={handleUpdate}
                      loading={update.isPending}
                    >
                      Spremi
                    </Button>
                    <Button size="xs" icon={<X size={12} />} onClick={() => setEditingId(null)}>
                      Odustani
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-[13px] font-medium truncate">{c.name}</span>
                    {c.isPredefined && (
                      <Pill color="muted">Predefinirano</Pill>
                    )}
                  </div>
                  {canEdit && (
                    <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!c.isPredefined && (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(c)}
                            className="p-1.5 text-muted hover:text-text rounded-md"
                            aria-label="Uredi"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleting(c)}
                            className="p-1.5 text-muted hover:text-danger rounded-md"
                            aria-label="Obriši"
                          >
                            <Trash2 size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-2xs text-muted mt-4 m-0">
        Predefinirane kategorije se ne mogu mijenjati. Brisanje korisničke kategorije je
        moguće samo ako nije vezana ni za jedan artikl.
      </p>

      <Modal
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Obriši kategoriju "${deleting?.name ?? ''}"?`}
        description="Ova akcija je nepovratna. Kategorija se može obrisati samo ako nema povezanih artikala."
        size="sm"
        footer={
          <>
            <Button onClick={() => setDeleting(null)} disabled={remove.isPending}>
              Odustani
            </Button>
            <Button
              variant="primary"
              onClick={handleDelete}
              loading={remove.isPending}
              className="!bg-danger !border-danger"
            >
              Obriši
            </Button>
          </>
        }
      >
        <span className="text-2xs text-muted">
          Predefinirane kategorije ne mogu se obrisati.
        </span>
      </Modal>
    </Card>
  );
}
