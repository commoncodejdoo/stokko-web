import { cn } from '@/view/common/utils/cn';

interface BrandGlyphProps {
  size?: number;
  className?: string;
}

export function BrandGlyph({ size = 36, className }: BrandGlyphProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        'inline-flex items-center justify-center rounded-lg bg-accent text-white shrink-0',
        className,
      )}
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 200 200" aria-hidden>
        <rect x="30" y="120" width="140" height="50" rx="8" fill="currentColor" />
        <rect x="50" y="65" width="100" height="50" rx="8" fill="currentColor" opacity="0.75" />
        <rect x="70" y="20" width="60" height="40" rx="8" fill="currentColor" opacity="0.5" />
      </svg>
    </div>
  );
}

export function BrandWordmark({ className }: { className?: string }) {
  return (
    <span className={cn('font-bold tracking-tight', className)}>
      sto<span className="text-accent">kk</span>o
    </span>
  );
}
