import { ReactNode, useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Search, X, Plus, Check } from 'lucide-react';
import { cn } from '@/view/common/utils/cn';

export interface PickerItem {
  id: string;
  label: string;
  sublabel?: string;
  /** Color dot rendered before the label (e.g. warehouse color). */
  color?: string;
  /** Mono meta on the right (e.g. SKU). */
  meta?: string;
}

interface PickerDialogProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  title: string;
  items: PickerItem[];
  selectedId?: string | null;
  onSelect(item: PickerItem): void;
  searchPlaceholder?: string;
  /** When defined, the picker shows a "Bez X" row that calls this on click. */
  nullOptionLabel?: string;
  onSelectNull?(): void;
  /** "+ Dodaj novi" CTA. When clicked, picker swaps to create mode. */
  addNewLabel?: string;
  canAddNew?: boolean;
  /** Content rendered inside the picker after the user clicks "+ Add". */
  renderCreateForm?(onClose: () => void): ReactNode;
}

export function PickerDialog({
  open,
  onOpenChange,
  title,
  items,
  selectedId,
  onSelect,
  searchPlaceholder = 'Pretraži…',
  nullOptionLabel,
  onSelectNull,
  addNewLabel,
  canAddNew,
  renderCreateForm,
}: PickerDialogProps) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'list' | 'create'>('list');

  useEffect(() => {
    if (!open) {
      setQuery('');
      setMode('list');
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.label.toLowerCase().includes(q) ||
        i.sublabel?.toLowerCase().includes(q) ||
        i.meta?.toLowerCase().includes(q),
    );
  }, [items, query]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
            'w-[92vw] max-w-[560px] bg-card border border-border rounded-lg shadow-xl',
            'flex flex-col overflow-hidden max-h-[80vh]',
          )}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <Dialog.Title className="m-0 text-[14px] font-semibold">
              {mode === 'create' && addNewLabel ? addNewLabel : title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Zatvori"
                className="text-muted hover:text-text p-1 -m-1 rounded-md"
              >
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>

          {mode === 'list' ? (
            <>
              <div className="px-4 py-2 border-b border-border flex items-center gap-2">
                <Search size={14} className="text-muted shrink-0" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="flex-1 bg-transparent border-none outline-none text-text text-[13px] placeholder:text-muted"
                />
              </div>

              <div className="overflow-y-auto scrollbar-thin flex-1 py-1">
                {nullOptionLabel && onSelectNull && (
                  <PickerRow
                    selected={selectedId === null}
                    onClick={() => {
                      onSelectNull();
                      onOpenChange(false);
                    }}
                  >
                    <span className="italic text-muted">{nullOptionLabel}</span>
                  </PickerRow>
                )}
                {filtered.length === 0 ? (
                  <div className="px-4 py-6 text-center text-2xs text-muted">
                    Nema rezultata.
                  </div>
                ) : (
                  filtered.map((item) => (
                    <PickerRow
                      key={item.id}
                      selected={item.id === selectedId}
                      onClick={() => {
                        onSelect(item);
                        onOpenChange(false);
                      }}
                    >
                      {item.color && (
                        <span
                          style={{ background: item.color }}
                          className="size-2.5 rounded-full shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium truncate">{item.label}</div>
                        {item.sublabel && (
                          <div className="text-2xs text-muted truncate">{item.sublabel}</div>
                        )}
                      </div>
                      {item.meta && (
                        <span className="text-2xs text-muted font-mono shrink-0">
                          {item.meta}
                        </span>
                      )}
                    </PickerRow>
                  ))
                )}
              </div>

              {canAddNew && addNewLabel && renderCreateForm && (
                <button
                  type="button"
                  onClick={() => setMode('create')}
                  className="flex items-center gap-2 px-4 py-3 border-t border-border text-[13px] text-accent hover:bg-card-hi transition-colors"
                >
                  <Plus size={14} />
                  {addNewLabel}
                </button>
              )}
            </>
          ) : (
            <div className="overflow-y-auto scrollbar-thin flex-1 px-4 py-4">
              {renderCreateForm?.(() => setMode('list'))}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function PickerRow({
  selected,
  onClick,
  children,
}: {
  selected?: boolean;
  onClick(): void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors',
        selected ? 'bg-accent-soft' : 'hover:bg-card-hi',
      )}
    >
      {children}
      {selected && <Check size={14} className="text-accent shrink-0" />}
    </button>
  );
}
