import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/view/common/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ invalid, className, ...rest }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full px-3 py-2 bg-card-hi border rounded-md text-text text-[13px]',
        'focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors',
        invalid ? 'border-danger' : 'border-border',
        className,
      )}
      {...rest}
    />
  ),
);
Input.displayName = 'Input';
