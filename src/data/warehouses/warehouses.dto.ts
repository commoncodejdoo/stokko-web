import { StockStatus } from '@/domain/common/stock-status';
import { Unit } from '@/domain/common/unit';

export interface WarehouseDto {
  id: string;
  name: string;
  color: string;
  kind: 'STORAGE' | 'FOH';
  initials: string;
}

export interface WarehousesListDto {
  items: WarehouseDto[];
}

export interface WarehouseArticleEntryDto {
  articleId: string;
  sku: string;
  name: string;
  unit: Unit;
  categoryId: string;
  supplierId: string | null;
  quantity: string;
  status: StockStatus;
  purchasePrice: string;
  currency: string;
}

export interface WarehouseArticlesPageDto {
  items: WarehouseArticleEntryDto[];
  summary: {
    articleCount: number;
    totalQuantity: string;
    totalValue: string;
    currency: string;
  };
}
