export type WarehouseKind = 'STORAGE' | 'FOH';

export const WAREHOUSE_KIND_LABELS_HR: Record<WarehouseKind, string> = {
  STORAGE: 'BOH',
  FOH: 'FOH',
};

export class Warehouse {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly color: string,
    readonly initials: string,
    readonly kind: WarehouseKind,
  ) {}
}
