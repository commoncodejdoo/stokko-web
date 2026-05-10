import { StockStatus } from '@/domain/common/stock-status';
import { Unit } from '@/domain/common/unit';

export interface StockByWarehouseDto {
  warehouseId: string;
  quantity: string;
  status: StockStatus;
}

export interface ArticleDto {
  id: string;
  sku: string;
  name: string;
  unit: Unit;
  categoryId: string;
  supplierId: string | null;
  purchasePrice: string;
  salePrice: string;
  currency: string;
  thresholdWarning: string;
  thresholdCritical: string;
  totalQuantity: string;
  status: StockStatus;
  stockByWarehouse?: StockByWarehouseDto[];
}

export interface ArticlesListDto {
  items: ArticleDto[];
}

export interface ArticleHistoryActorDto {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  initials: string;
}

export interface ArticleHistoryItemDto {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  user: ArticleHistoryActorDto | null;
  before: unknown;
  after: unknown;
  createdAt: string;
}

export interface ArticleHistoryDto {
  items: ArticleHistoryItemDto[];
  pagination: { page: number; pageSize: number; total: number };
}
