import { cn } from '@/view/common/utils/cn';

interface AvatarProps {
  initials: string;
  size?: number;
  tone?: 'accent' | 'muted' | 'success';
  className?: string;
}

const TONE_CLASS: Record<NonNullable<AvatarProps['tone']>, string> = {
  accent: 'bg-accent text-white',
  muted: 'bg-card-hi text-text border border-border',
  success: 'bg-success text-white',
};

export function Avatar({ initials, size = 28, tone = 'muted', className }: AvatarProps) {
  return (
    <div
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold shrink-0',
        TONE_CLASS[tone],
        className,
      )}
    >
      {initials}
    </div>
  );
}
