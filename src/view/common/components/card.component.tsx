import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/view/common/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

const PADDING: Record<NonNullable<CardProps['padding']>, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ padding = 'md', className, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn('bg-card border border-border rounded-lg', PADDING[padding], className)}
      {...rest}
    />
  ),
);
Card.displayName = 'Card';
