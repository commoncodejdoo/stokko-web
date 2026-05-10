import { ReactNode } from 'react';
import { cn } from '@/view/common/utils/cn';

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 font-mono text-2xs text-muted bg-card-hi border border-border rounded-sm',
        className,
      )}
    >
      {children}
    </span>
  );
}
