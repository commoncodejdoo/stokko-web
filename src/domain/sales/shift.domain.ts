export type ShiftStatus = 'OPEN' | 'CLOSED';

export const SHIFT_STATUS_LABELS_HR: Record<ShiftStatus, string> = {
  OPEN: 'Otvorena',
  CLOSED: 'Zatvorena',
};

export class Shift {
  constructor(
    readonly id: string,
    /** ISO 8601 date (no time). */
    readonly date: string,
    readonly openedAt: string,
    readonly closedAt: string | null,
    readonly closedById: string | null,
    readonly status: ShiftStatus,
    /** Decimal string (3 fraction digits). */
    readonly totalQuantity: string,
    /** Decimal string (2 fraction digits). */
    readonly totalRevenue: string,
    readonly currency: string,
  ) {}
}
