export type Urgency = 'CRITICAL' | 'WARNING' | 'OK';

export class PredictionSnapshot {
  constructor(
    readonly id: string,
    readonly warehouseId: string,
    readonly articleId: string,
    readonly currentStock: string,
    readonly avgDailyConsumption: string | null,
    readonly daysOfSupply: string | null,
    readonly shouldReorder: boolean,
    readonly suggestedQty: string,
    readonly urgency: Urgency,
    readonly leadTimeDaysUsed: number,
    readonly safetyDaysUsed: number,
    readonly coverageDaysUsed: number,
    readonly signalWindowDays: number,
    readonly computedAt: string,
    readonly validUntil: string,
  ) {}

  isCritical(): boolean {
    return this.urgency === 'CRITICAL';
  }
}

export interface PredictionsSummary {
  criticalCount: number;
  warningCount: number;
  okCount: number;
  shouldReorderCount: number;
}

export interface PredictionsCurrent {
  items: PredictionSnapshot[];
  summary: PredictionsSummary;
}

export interface RecomputeSummary {
  organizationId: string;
  computedAt: string;
  totalTuples: number;
  criticalCount: number;
  warningCount: number;
  okCount: number;
  shouldReorderCount: number;
}
