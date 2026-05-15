import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ChevronRight } from 'lucide-react';
import { cn } from '@/view/common/utils/cn';

interface Props {
  criticalCount: number;
  warningCount: number;
  shouldReorderCount: number;
}

/**
 * Dashboard banner — hidden when there is nothing actionable.
 * Click → navigates to /recommendations.
 */
export function RecommendationsBanner({
  criticalCount,
  warningCount,
  shouldReorderCount,
}: Props) {
  const navigate = useNavigate();
  if (criticalCount === 0 && warningCount === 0 && shouldReorderCount === 0) {
    return null;
  }

  const isCritical = criticalCount > 0;
  const label = isCritical
    ? `${criticalCount} kritičan artikl${criticalCount === 1 ? '' : 'a'}`
    : `${warningCount} upozorenje${warningCount === 1 ? '' : warningCount < 5 ? 'a' : 'a'}`;
  const sub =
    shouldReorderCount > 0
      ? `${shouldReorderCount} za nabavu — otvori preporuke`
      : 'Pregledaj preporuke';

  return (
    <button
      type="button"
      onClick={() => navigate('/recommendations')}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors text-left cursor-pointer',
        isCritical
          ? 'bg-danger/10 border-danger/30 hover:bg-danger/15'
          : 'bg-warning/10 border-warning/30 hover:bg-warning/15',
      )}
    >
      <ShoppingCart
        size={20}
        className={isCritical ? 'text-danger' : 'text-warning'}
      />
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            'text-[14px] font-semibold',
            isCritical ? 'text-danger' : 'text-warning',
          )}
        >
          {label}
        </div>
        <div
          className={cn(
            'text-2xs mt-0.5',
            isCritical ? 'text-danger/80' : 'text-warning/80',
          )}
        >
          {sub}
        </div>
      </div>
      <ChevronRight
        size={16}
        className={isCritical ? 'text-danger' : 'text-warning'}
      />
    </button>
  );
}
