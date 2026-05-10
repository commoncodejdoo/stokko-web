import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/domain/dashboard';

export function useDashboardOverview() {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => dashboardService.getOverview(),
  });
}
