import { ReactNode } from 'react';
import { cn } from '@/view/common/utils/cn';

export interface Column<T> {
  key: string;
  label: ReactNode;
  width?: string;
  align?: 'left' | 'right' | 'center';
  muted?: boolean;
  render?(row: T, idx: number): ReactNode;
}

interface TableProps<T> {
  cols: Column<T>[];
  rows: T[];
  onRowClick?(row: T): void;
  emptyMessage?: string;
  className?: string;
  rowKey?(row: T, idx: number): string;
}

export function Table<T>({
  cols,
  rows,
  onRowClick,
  emptyMessage = 'Nema podataka.',
  className,
  rowKey,
}: TableProps<T>) {
  const gridTemplate = cols.map((c) => c.width ?? '1fr').join(' ');

  const alignClass = (align?: Column<T>['align']) =>
    align === 'right' ? 'text-right justify-end' : align === 'center' ? 'text-center justify-center' : 'text-left';

  return (
    <div
      className={cn(
        'border border-border rounded-lg overflow-hidden bg-card',
        className,
      )}
    >
      <div
        style={{ gridTemplateColumns: gridTemplate }}
        className="grid px-4 py-2.5 border-b border-border bg-card-hi text-[11px] font-medium text-muted uppercase tracking-wider"
      >
        {cols.map((c, i) => (
          <div key={i} className={cn('truncate', alignClass(c.align))}>
            {c.label}
          </div>
        ))}
      </div>
      {rows.length === 0 ? (
        <div className="px-4 py-10 text-center text-2xs text-muted">{emptyMessage}</div>
      ) : (
        rows.map((row, ri) => (
          <div
            key={rowKey ? rowKey(row, ri) : ri}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            style={{ gridTemplateColumns: gridTemplate }}
            className={cn(
              'grid px-4 py-2.5 text-[13px] items-center',
              ri < rows.length - 1 && 'border-b border-border',
              onRowClick && 'cursor-pointer hover:bg-card-hi transition-colors',
            )}
          >
            {cols.map((c, ci) => (
              <div
                key={ci}
                className={cn(
                  'truncate min-w-0',
                  alignClass(c.align),
                  c.muted ? 'text-muted' : 'text-text',
                )}
              >
                {c.render ? c.render(row, ri) : ((row as Record<string, unknown>)[c.key] as ReactNode)}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
