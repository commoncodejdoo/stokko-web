import { httpClient } from '@/data/common/http-client';
import { HttpDashboardRepository } from '@/data/dashboard/dashboard.repository';
import { DashboardService } from './dashboard.service';

export * from './dashboard.domain';
export * from './dashboard.repository';
export * from './dashboard.service';

export const dashboardService = new DashboardService(new HttpDashboardRepository(httpClient));
