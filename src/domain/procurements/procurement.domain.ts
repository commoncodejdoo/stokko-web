export interface ProcurementItem {
  id: string;
  articleId: string;
  /** Decimal string (3 fraction digits). */
  quantity: string;
  /** Decimal string (2 fraction digits). */
  purchasePrice: string;
  /** Decimal string (2 fraction digits) — quantity × purchasePrice. */
  lineTotal: string;
}

export class Procurement {
  constructor(
    readonly id: string,
    readonly supplierId: string | null,
    readonly warehouseId: string,
    readonly createdById: string,
    readonly note: string | null,
    readonly createdAt: string,
    readonly currency: string,
    readonly totalValue: string,
    readonly items: ProcurementItem[],
  ) {}
}
