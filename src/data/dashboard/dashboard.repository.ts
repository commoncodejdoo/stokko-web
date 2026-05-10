import { AxiosInstance } from 'axios';
import { DashboardOverview } from '@/domain/dashboard/dashboard.domain';
import { DashboardRepository } from '@/domain/dashboard/dashboard.repository';
import { DashboardOverviewDto } from './dashboard.dto';

export class HttpDashboardRepository implements DashboardRepository {
  constructor(private readonly http: AxiosInstance) {}

  async getOverview(): Promise<DashboardOverview> {
    const { data } = await this.http.get<DashboardOverviewDto>('/dashboard');
    return new DashboardOverview(data.counts, data.perWarehouse, data.recentActivity);
  }
}
