/**
 * Hrvatska locale formatiranje brojeva, novca i datuma.
 */

const NUMBER = new Intl.NumberFormat('hr-HR');
const MONEY_FALLBACK = new Intl.NumberFormat('hr-HR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const DATE_DDMMYYYY = new Intl.DateTimeFormat('hr-HR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});
const DATETIME_FULL = new Intl.DateTimeFormat('hr-HR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function fmtNumber(value: number | string): string {
  const n = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(n)) return String(value);
  return NUMBER.format(n);
}

export function fmtMoney(value: number | string, currency = 'EUR'): string {
  const n = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(n)) return `${value} ${currency}`;
  try {
    return new Intl.NumberFormat('hr-HR', {
      style: 'currency',
      currency,
      currencyDisplay: 'symbol',
    }).format(n);
  } catch {
    return `${MONEY_FALLBACK.format(n)} ${currency}`;
  }
}

export function fmtDate(date: Date | string | number): string {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return String(date);
  return DATE_DDMMYYYY.format(d);
}

export function fmtDateTime(date: Date | string | number): string {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return String(date);
  return DATETIME_FULL.format(d);
}
