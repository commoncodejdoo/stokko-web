/**
 * Stock-level status — mirrors the backend enum.
 */
export type StockStatus = 'OK' | 'WARNING' | 'CRITICAL' | 'UNKNOWN';

export const STOCK_STATUS_LABELS_HR: Record<StockStatus, string> = {
  OK: 'OK',
  WARNING: 'Upozorenje',
  CRITICAL: 'Kritično',
  UNKNOWN: 'Bez podataka',
};
