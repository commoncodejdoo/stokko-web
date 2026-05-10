import { ReactNode } from 'react';
import { Card } from './card.component';
import { Sparkline } from './sparkline.component';
import { cn } from '@/view/common/utils/cn';

interface StatProps {
  label: string;
  value: ReactNode;
  delta?: string;
  trend?: number[];
  color?: string;
  className?: string;
}

export function Stat({ label, value, delta, trend, color, className }: StatProps) {
  const deltaPositive = typeof delta === 'string' && delta.trim().startsWith('+');
  return (
    <Card padding="md" className={className}>
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <div className="text-2xs text-muted mb-1">{label}</div>
          <div className="text-2xl font-semibold tracking-tight truncate">{value}</div>
          {delta && (
            <div
              className={cn(
                'text-2xs mt-1',
                deltaPositive ? 'text-success' : 'text-danger',
              )}
            >
              {delta}
            </div>
          )}
        </div>
        {trend && trend.length > 0 && (
          <Sparkline data={trend} color={color ?? 'var(--accent)'} width={72} height={28} />
        )}
      </div>
    </Card>
  );
}
