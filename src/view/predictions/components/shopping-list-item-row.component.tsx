import { X, Check } from 'lucide-react';
import { ShoppingListItem } from '@/domain/shopping-lists/shopping-list.domain';
import { cn } from '@/view/common/utils/cn';

interface Props {
  item: ShoppingListItem;
  articleName: string;
  articleUnit: string;
  warehouseName: string;
  onToggle: () => void;
  onRemove?: () => void;
}

export function ShoppingListItemRow({
  item,
  articleName,
  articleUnit,
  warehouseName,
  onToggle,
  onRemove,
}: Props) {
  const qty = item.effectiveQty();
  const eur = (item.estimatedPriceCents / 100).toFixed(2);

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 bg-card border border-border rounded-md hover:bg-card-hi transition-colors">
      <button
        type="button"
        aria-label={item.isChecked ? 'Ukloni oznaku' : 'Označi'}
        onClick={onToggle}
        className={cn(
          'shrink-0 size-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer',
          item.isChecked
            ? 'bg-accent border-accent text-white'
            : 'border-border hover:border-muted',
        )}
      >
        {item.isChecked && <Check size={12} strokeWidth={3} />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-medium truncate">{articleName}</div>
        <div className="text-2xs text-muted mt-0.5 truncate">
          {warehouseName} · {Number(qty).toFixed(0)} {articleUnit} · {eur} EUR
        </div>
      </div>
      {onRemove && (
        <button
          type="button"
          aria-label="Ukloni stavku"
          onClick={onRemove}
          className="shrink-0 text-muted hover:text-danger p-1 rounded cursor-pointer transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
