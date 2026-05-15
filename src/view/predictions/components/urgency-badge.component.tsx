import { Pill } from '@/view/common/components/pill.component';
import { Urgency } from '@/domain/predictions/prediction-snapshot.domain';

const LABEL: Record<Urgency, string> = {
  CRITICAL: 'Kritično',
  WARNING: 'Upozorenje',
  OK: 'U redu',
};

const COLOR: Record<Urgency, 'danger' | 'warning' | 'success'> = {
  CRITICAL: 'danger',
  WARNING: 'warning',
  OK: 'success',
};

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  return (
    <Pill color={COLOR[urgency]} dot>
      {LABEL[urgency]}
    </Pill>
  );
}
