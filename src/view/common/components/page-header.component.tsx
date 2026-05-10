import { ReactNode } from 'react';
import { cn } from '@/view/common/utils/cn';

interface PageHeaderProps {
  title: ReactNode;
  sub?: ReactNode;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, sub, breadcrumb, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('px-8 py-5 border-b border-border', className)}>
      {breadcrumb && <div className="text-2xs text-muted mb-1.5">{breadcrumb}</div>}
      <div className="flex items-end justify-between gap-6">
        <div className="min-w-0">
          <h1 className="m-0 text-[22px] font-semibold tracking-tight truncate">{title}</h1>
          {sub && <p className="m-0 mt-1 text-[13px] text-muted">{sub}</p>}
        </div>
        {actions && <div className="flex gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
