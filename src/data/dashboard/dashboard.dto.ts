import {
  DashboardActivityActor,
  DashboardCounts,
  DashboardWarehouseStat,
} from '@/domain/dashboard/dashboard.domain';

export interface DashboardOverviewDto {
  counts: DashboardCounts;
  perWarehouse: DashboardWarehouseStat[];
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    user: DashboardActivityActor | null;
    before: unknown;
    after: unknown;
    createdAt: string;
  }>;
}
