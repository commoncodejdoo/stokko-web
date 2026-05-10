import { httpClient } from '@/data/common/http-client';
import { HttpSalesReportRepository } from '@/data/analytics/sales-report.repository';
import { SalesReportService } from './sales-report.service';

export * from './sales-report.domain';
export * from './sales-report.repository';
export * from './sales-report.service';

export const salesReportService = new SalesReportService(
  new HttpSalesReportRepository(httpClient),
);
