import { ReportPeriod, SalesReport } from './sales-report.domain';
import { SalesReportRepository } from './sales-report.repository';

export class SalesReportService {
  constructor(private readonly repo: SalesReportRepository) {}

  getReport(period: ReportPeriod, offset: number): Promise<SalesReport> {
    return this.repo.getReport(period, offset);
  }
}
