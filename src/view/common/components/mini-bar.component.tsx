import { cn } from '@/view/common/utils/cn';

interface MiniBarProps {
  value: number;
  max: number;
  color?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function MiniBar({ value, max, color, width = 100, height = 6, className }: MiniBarProps) {
  const pct = Math.max(0, Math.min(100, max ? (value / max) * 100 : 0));
  return (
    <div
      style={{ width, height }}
      className={cn('bg-card-hi rounded-full overflow-hidden', className)}
    >
      <div
        style={{ width: `${pct}%`, background: color ?? 'var(--accent)', height: '100%' }}
        className="rounded-full transition-all"
      />
    </div>
  );
}
