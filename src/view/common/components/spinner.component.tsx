import { cn } from '@/view/common/utils/cn';

export function Spinner({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <span
      style={{ width: size, height: size }}
      className={cn(
        'inline-block rounded-full border-2 border-muted border-r-transparent animate-spin',
        className,
      )}
    />
  );
}
