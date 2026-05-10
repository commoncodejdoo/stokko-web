export type Unit = 'KOM' | 'KG' | 'L' | 'BOCA' | 'GAJBA' | 'PAKET' | 'KUTIJA';

export const ALL_UNITS: Unit[] = ['KOM', 'KG', 'L', 'BOCA', 'GAJBA', 'PAKET', 'KUTIJA'];

export const UNIT_LABELS_HR: Record<Unit, string> = {
  KOM: 'kom',
  KG: 'kg',
  L: 'L',
  BOCA: 'boca',
  GAJBA: 'gajba',
  PAKET: 'paket',
  KUTIJA: 'kutija',
};

const FRACTIONAL = new Set<Unit>(['KG', 'L']);
export const isFractionalUnit = (u: Unit): boolean => FRACTIONAL.has(u);

export function formatQuantity(quantity: string | number, unit: Unit): string {
  const n = Number(quantity);
  if (Number.isNaN(n)) return String(quantity);
  return isFractionalUnit(unit) ? n.toFixed(3) : Math.round(n).toString();
}
