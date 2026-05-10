import { Unit } from '../common/unit';
import { Article } from './article.domain';

export interface ListArticlesParams {
  q?: string;
  categoryId?: string;
  supplierId?: string;
  status?: 'low' | 'all';
}

export interface InitialStockEntry {
  warehouseId: string;
  quantity: string;
}

export interface CreateArticlePayload {
  sku: string;
  name: string;
  unit: Unit;
  categoryId: string;
  supplierId?: string | null;
  purchasePrice: string;
  salePrice: string;
  thresholdWarning: string;
  thresholdCritical: string;
  initialStock?: InitialStockEntry[];
}

export interface UpdateArticlePayload {
  sku?: string;
  name?: string;
  unit?: Unit;
  categoryId?: string;
  supplierId?: string | null;
  purchasePrice?: string;
  salePrice?: string;
  thresholdWarning?: string;
  thresholdCritical?: string;
}

export interface ArticleHistoryActor {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  initials: string;
}

export interface ArticleHistoryEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  user: ArticleHistoryActor | null;
  before: unknown;
  after: unknown;
  createdAt: string;
}

export interface ArticleHistoryPage {
  items: ArticleHistoryEntry[];
  pagination: { page: number; pageSize: number; total: number };
}

export interface ArticlesRepository {
  list(params?: ListArticlesParams): Promise<Article[]>;
  findById(id: string): Promise<Article>;
  create(payload: CreateArticlePayload): Promise<Article>;
  update(id: string, payload: UpdateArticlePayload): Promise<Article>;
  remove(id: string): Promise<void>;
  getHistory(id: string, page?: number, pageSize?: number): Promise<ArticleHistoryPage>;
}
