import { ReactNode } from 'react';
import { cn } from '@/view/common/utils/cn';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-6',
        'border border-dashed border-border rounded-lg',
        className,
      )}
    >
      {icon && <div className="mb-3 text-muted">{icon}</div>}
      <div className="text-[14px] font-medium">{title}</div>
      {description && <div className="text-2xs text-muted mt-1 max-w-md">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
