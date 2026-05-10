import { DashboardOverview } from './dashboard.domain';
import { DashboardRepository } from './dashboard.repository';

export class DashboardService {
  constructor(private readonly repo: DashboardRepository) {}

  getOverview(): Promise<DashboardOverview> {
    return this.repo.getOverview();
  }
}
