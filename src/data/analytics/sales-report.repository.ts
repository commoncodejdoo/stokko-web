import { AxiosInstance } from 'axios';
import { ReportPeriod, SalesReport } from '@/domain/analytics/sales-report.domain';
import { SalesReportRepository } from '@/domain/analytics/sales-report.repository';
import { SalesReportDto } from './sales-report.dto';

export class HttpSalesReportRepository implements SalesReportRepository {
  constructor(private readonly http: AxiosInstance) {}

  async getReport(period: ReportPeriod, offset: number): Promise<SalesReport> {
    const { data } = await this.http.get<SalesReportDto>('/sales/report', {
      params: { period, offset },
    });
    return data;
  }
}
