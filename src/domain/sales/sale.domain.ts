export interface SaleItem {
  id: string;
  articleId: string;
  /** Decimal string. */
  quantity: string;
  /** Decimal string. */
  unitPrice: string;
  /** Decimal string. */
  lineTotal: string;
}

export class Sale {
  constructor(
    readonly id: string,
    readonly shiftId: string,
    readonly warehouseId: string,
    readonly createdById: string,
    readonly createdAt: string,
    readonly currency: string,
    readonly totalQuantity: string,
    readonly totalRevenue: string,
    readonly items: SaleItem[],
  ) {}
}
