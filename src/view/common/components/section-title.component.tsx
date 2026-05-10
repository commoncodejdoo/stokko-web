import { ReactNode } from 'react';
import { cn } from '@/view/common/utils/cn';

interface SectionTitleProps {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function SectionTitle({ children, action, className }: SectionTitleProps) {
  return (
    <div className={cn('flex justify-between items-center mb-3', className)}>
      <h2 className="m-0 text-2xs font-semibold text-muted uppercase tracking-wider">{children}</h2>
      {action}
    </div>
  );
}
