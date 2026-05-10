import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/view/common/utils/cn';

type Variant = 'primary' | 'ghost' | 'quiet' | 'danger';
type Size = 'xs' | 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  full?: boolean;
  loading?: boolean;
}

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'bg-accent text-white border-accent hover:opacity-90',
  ghost: 'bg-transparent text-text border-border hover:bg-card-hi',
  quiet: 'bg-transparent text-muted border-transparent hover:text-text',
  danger: 'bg-transparent text-danger border-border hover:bg-card-hi',
};

const SIZE_CLASS: Record<Size, string> = {
  xs: 'px-2 py-1 text-2xs gap-1.5',
  sm: 'px-3 py-1.5 text-[13px] gap-1.5',
  md: 'px-4 py-2 text-[14px] gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'ghost', size = 'sm', icon, full, loading, disabled, className, children, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-md border transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent',
          VARIANT_CLASS[variant],
          SIZE_CLASS[size],
          full && 'w-full',
          className,
        )}
        {...rest}
      >
        {loading ? (
          <span className="size-3.5 inline-block rounded-full border-2 border-current border-r-transparent animate-spin" />
        ) : (
          icon
        )}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
