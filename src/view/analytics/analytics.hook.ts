import { useQuery } from '@tanstack/react-query';
import { salesReportService, ReportPeriod } from '@/domain/analytics';

export function useSalesReport(period: ReportPeriod, offset: number) {
  return useQuery({
    queryKey: ['sales-report', period, offset],
    queryFn: () => salesReportService.getReport(period, offset),
  });
}
