import { StockStatus } from '../common/stock-status';
import { Unit } from '../common/unit';
import { Warehouse, WarehouseKind } from './warehouse.domain';

export interface CreateWarehousePayload {
  name: string;
  color: string;
  kind?: WarehouseKind;
}

export interface UpdateWarehousePayload {
  name?: string;
  color?: string;
  kind?: WarehouseKind;
}

export interface WarehouseArticleEntry {
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

export interface WarehouseArticlesSummary {
  articleCount: number;
  totalQuantity: string;
  totalValue: string;
  currency: string;
}

export interface WarehouseArticlesPage {
  items: WarehouseArticleEntry[];
  summary: WarehouseArticlesSummary;
}

export interface WarehousesRepository {
  list(): Promise<Warehouse[]>;
  findById(id: string): Promise<Warehouse>;
  create(payload: CreateWarehousePayload): Promise<Warehouse>;
  update(id: string, payload: UpdateWarehousePayload): Promise<Warehouse>;
  remove(id: string): Promise<void>;
  getArticles(id: string): Promise<WarehouseArticlesPage>;
}
