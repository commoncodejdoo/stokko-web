import { Fragment, ReactNode } from 'react';
import { Bell, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/view/common/theme/use-theme.hook';

interface TopbarProps {
  breadcrumb?: ReactNode[];
  actions?: ReactNode;
}

export function Topbar({ breadcrumb, actions }: TopbarProps) {
  const { isDark, toggle } = useTheme();
  const items = breadcrumb ?? [];

  return (
    <header className="h-12 px-6 border-b border-border flex items-center justify-between gap-4 shrink-0 bg-panel">
      <div className="flex items-center gap-2 text-[13px] text-muted min-w-0">
        {items.map((item, i) => (
          <Fragment key={i}>
            {i > 0 && <span className="text-faint">/</span>}
            <span
              className={
                i === items.length - 1 ? 'text-text font-medium truncate' : 'text-muted truncate'
              }
            >
              {item}
            </span>
          </Fragment>
        ))}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {actions}
        <button
          type="button"
          onClick={toggle}
          aria-label={isDark ? 'Svijetla tema' : 'Tamna tema'}
          className="border border-border rounded-md p-1.5 text-muted hover:text-text hover:bg-card-hi transition-colors"
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <button
          type="button"
          aria-label="Obavijesti"
          className="border border-border rounded-md p-1.5 text-muted hover:text-text hover:bg-card-hi transition-colors relative"
        >
          <Bell size={15} />
          <span className="absolute top-1 right-1 size-1.5 rounded-full bg-accent" />
        </button>
      </div>
    </header>
  );
}
