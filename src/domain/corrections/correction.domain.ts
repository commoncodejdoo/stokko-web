export type CorrectionType = 'ABSOLUTE' | 'DELTA';

export const ALL_CORRECTION_TYPES: CorrectionType[] = ['ABSOLUTE', 'DELTA'];

export const CORRECTION_TYPE_LABELS_HR: Record<CorrectionType, string> = {
  ABSOLUTE: 'Apsolutno',
  DELTA: 'Razlika',
};

export type CorrectionReason = 'COUNT' | 'WRITE_OFF' | 'INPUT_ERROR' | 'OTHER';

export const ALL_CORRECTION_REASONS: CorrectionReason[] = [
  'COUNT',
  'WRITE_OFF',
  'INPUT_ERROR',
  'OTHER',
];

export const CORRECTION_REASON_LABELS_HR: Record<CorrectionReason, string> = {
  COUNT: 'Inventura',
  WRITE_OFF: 'Kvar / otpis',
  INPUT_ERROR: 'Pogreška pri unosu',
  OTHER: 'Ostalo',
};

export class StockCorrection {
  constructor(
    readonly id: string,
    readonly articleId: string,
    readonly warehouseId: string,
    readonly type: CorrectionType,
    readonly value: string,
    readonly reason: CorrectionReason,
    readonly note: string | null,
    readonly createdById: string,
    readonly createdAt: string,
  ) {}
}
