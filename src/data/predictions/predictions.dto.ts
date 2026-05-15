export type UrgencyDto = 'CRITICAL' | 'WARNING' | 'OK';

export interface PredictionSnapshotDto {
  id: string;
  warehouseId: string;
  articleId: string;
  currentStock: string;
  avgDailyConsumption: string | null;
  daysOfSupply: string | null;
  shouldReorder: boolean;
  suggestedQty: string;
  urgency: UrgencyDto;
  leadTimeDaysUsed: number;
  safetyDaysUsed: number;
  coverageDaysUsed: number;
  signalWindowDays: number;
  computedAt: string;
  validUntil: string;
}

export interface PredictionsSummaryDto {
  criticalCount: number;
  warningCount: number;
  okCount: number;
  shouldReorderCount: number;
}

export interface PredictionsCurrentDto {
  items: PredictionSnapshotDto[];
  summary: PredictionsSummaryDto;
}

export interface RecomputeSummaryDto {
  organizationId: string;
  computedAt: string;
  totalTuples: number;
  criticalCount: number;
  warningCount: number;
  okCount: number;
  shouldReorderCount: number;
}
