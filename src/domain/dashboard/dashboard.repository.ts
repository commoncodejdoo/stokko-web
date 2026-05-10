import { DashboardOverview } from './dashboard.domain';

export interface DashboardRepository {
  getOverview(): Promise<DashboardOverview>;
}
