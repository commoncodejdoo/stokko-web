import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/view/common/utils/cn';

type PillColor = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'muted';

interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  color?: PillColor;
  dot?: boolean;
  children: ReactNode;
}

const COLOR_CLASS: Record<PillColor, string> = {
  neutral: 'bg-card-hi text-muted border-border',
  muted: 'bg-card-hi text-muted border-border',
  accent: 'bg-accent-soft text-accent border-accent/30',
  success: 'bg-success/10 text-success border-success/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
  danger: 'bg-danger/10 text-danger border-danger/30',
};

const DOT_CLASS: Record<PillColor, string> = {
  neutral: 'bg-muted',
  muted: 'bg-muted',
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

export function Pill({ color = 'neutral', dot, className, children, ...rest }: PillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-2xs font-medium border whitespace-nowrap',
        COLOR_CLASS[color],
        className,
      )}
      {...rest}
    >
      {dot && <span className={cn('size-1.5 rounded-full', DOT_CLASS[color])} />}
      {children}
    </span>
  );
}
