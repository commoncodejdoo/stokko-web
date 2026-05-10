import { StockStatus } from '../common/stock-status';
import { Unit } from '../common/unit';

export interface StockByWarehouse {
  warehouseId: string;
  /** Decimal string preserved for display precision. */
  quantity: string;
  status: StockStatus;
}

export class Article {
  constructor(
    readonly id: string,
    readonly sku: string,
    readonly name: string,
    readonly unit: Unit,
    readonly categoryId: string,
    readonly supplierId: string | null,
    readonly purchasePrice: string,
    readonly salePrice: string,
    readonly currency: string,
    readonly thresholdWarning: string,
    readonly thresholdCritical: string,
    readonly totalQuantity: string,
    readonly status: StockStatus,
    readonly stockByWarehouse?: StockByWarehouse[],
  ) {}
}
