export type ReportPeriod = 'day' | 'week' | 'month' | 'year';

export interface ReportRange {
  kind: ReportPeriod;
  offset: number;
  /** ISO string. */
  from: string;
  /** ISO string. */
  to: string;
  label: string;
}

export interface ReportTotals {
  qty: string;
  revenue: string;
  currency: string;
}

export interface ReportByDateBucket {
  /** YYYY-MM-DD. */
  date: string;
  qty: string;
  revenue: string;
}

export interface ReportByArticleBucket {
  articleId: string;
  name: string;
  qty: string;
  revenue: string;
}

export interface ReportShiftEntry {
  id: string;
  date: string;
  status: 'OPEN' | 'CLOSED';
  closedAt: string | null;
  closedBy: {
    id: string;
    firstName: string;
    lastName: string;
    initials: string;
  } | null;
  totalQuantity: string;
  totalRevenue: string;
}

export interface SalesReport {
  period: ReportRange;
  totals: ReportTotals;
  byDate: ReportByDateBucket[];
  byArticle: ReportByArticleBucket[];
  shifts: ReportShiftEntry[];
}
