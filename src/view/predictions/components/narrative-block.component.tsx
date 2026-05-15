import { Sparkles } from 'lucide-react';
import { Card } from '@/view/common/components/card.component';
import { Spinner } from '@/view/common/components/spinner.component';

interface Props {
  body?: string;
  isLoading?: boolean;
  errorMessage?: string | null;
  modelHint?: string;
}

export function NarrativeBlock({
  body,
  isLoading,
  errorMessage,
  modelHint,
}: Props) {
  return (
    <Card padding="md" className="bg-accent-soft/40 border-accent/20">
      <div className="flex items-center gap-1.5 text-2xs uppercase tracking-wider text-accent font-medium">
        <Sparkles size={12} />
        AI sažetak
      </div>
      {isLoading ? (
        <div className="mt-2 flex items-center">
          <Spinner />
        </div>
      ) : errorMessage ? (
        <div className="mt-2 text-[13px] text-danger">{errorMessage}</div>
      ) : (
        <div className="mt-2 text-[14px] leading-relaxed text-text">
          {body ?? 'Sažetak još nije generiran.'}
        </div>
      )}
      {modelHint && (
        <div className="mt-2 text-2xs text-muted">{modelHint}</div>
      )}
    </Card>
  );
}
