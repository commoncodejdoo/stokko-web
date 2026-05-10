import { ReportPeriod, SalesReport } from './sales-report.domain';

export interface SalesReportRepository {
  getReport(period: ReportPeriod, offset: number): Promise<SalesReport>;
}
