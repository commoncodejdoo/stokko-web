import { ChevronRight } from 'lucide-react';
import { Card } from '@/view/common/components/card.component';
import { PredictionSnapshot } from '@/domain/predictions/prediction-snapshot.domain';
import { UrgencyBadge } from './urgency-badge.component';

interface Props {
  snapshot: PredictionSnapshot;
  articleName: string;
  articleUnit: string;
  warehouseName: string;
  onSelect?: () => void;
}

export function RecommendationCard({
  snapshot,
  articleName,
  articleUnit,
  warehouseName,
  onSelect,
}: Props) {
  const dos = snapshot.daysOfSupply
    ? `${Number(snapshot.daysOfSupply).toFixed(1)} dana zaliha`
    : 'nema potrošnog signala';

  return (
    <Card
      padding="md"
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect}
      onKeyDown={
        onSelect
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect();
              }
            }
          : undefined
      }
      className={
        onSelect
          ? 'cursor-pointer hover:bg-card-hi transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent'
          : ''
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[14px] font-semibold truncate">{articleName}</div>
          <div className="text-2xs text-muted mt-0.5">{warehouseName}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <UrgencyBadge urgency={snapshot.urgency} />
          {onSelect && <ChevronRight size={14} className="text-muted" />}
        </div>
      </div>
      <div className="flex items-baseline gap-6 mt-3">
        <Stat label="Stanje" value={`${Number(snapshot.currentStock).toFixed(2)} ${articleUnit}`} />
        <Stat
          label="Prijedlog"
          value={`${Number(snapshot.suggestedQty).toFixed(0)} ${articleUnit}`}
        />
        <Stat label="DOS" value={dos} small />
      </div>
    </Card>
  );
}

function Stat({
  label,
  value,
  small,
}: {
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div>
      <div className="text-2xs text-muted uppercase tracking-wider">{label}</div>
      <div className={small ? 'text-2xs text-muted mt-0.5' : 'text-[14px] font-medium mt-0.5'}>
        {value}
      </div>
    </div>
  );
}
