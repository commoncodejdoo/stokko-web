export interface StockTransferItem {
  id: string;
  articleId: string;
  /** Decimal string (3 fraction digits). */
  quantity: string;
}

export class StockTransfer {
  constructor(
    readonly id: string,
    readonly sourceWarehouseId: string,
    readonly destinationWarehouseId: string,
    readonly createdById: string,
    readonly note: string | null,
    readonly createdAt: string,
    readonly items: StockTransferItem[],
  ) {}
}
