import { ReactNode } from 'react';
import { cn } from '@/view/common/utils/cn';

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  cols?: 1 | 2;
  children: ReactNode;
  className?: string;
}

export function Field({ label, hint, error, cols, children, className }: FieldProps) {
  return (
    <div className={cn(cols === 2 && 'col-span-2', className)}>
      <label className="block text-2xs text-muted mb-1.5">{label}</label>
      {children}
      {hint && !error && <div className="text-2xs text-muted mt-1">{hint}</div>}
      {error && <div className="text-2xs text-danger mt-1">{error}</div>}
    </div>
  );
}
