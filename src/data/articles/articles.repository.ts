import { AxiosInstance } from 'axios';
import { Article } from '@/domain/articles/article.domain';
import {
  ArticleHistoryPage,
  ArticlesRepository,
  CreateArticlePayload,
  ListArticlesParams,
  UpdateArticlePayload,
} from '@/domain/articles/articles.repository';
import { ArticleDto, ArticlesListDto, ArticleHistoryDto } from './articles.dto';

const fromDto = (d: ArticleDto): Article =>
  new Article(
    d.id,
    d.sku,
    d.name,
    d.unit,
    d.categoryId,
    d.supplierId,
    d.purchasePrice,
    d.salePrice,
    d.currency,
    d.thresholdWarning,
    d.thresholdCritical,
    d.totalQuantity,
    d.status,
    d.stockByWarehouse?.map((s) => ({
      warehouseId: s.warehouseId,
      quantity: s.quantity,
      status: s.status,
    })),
  );

export class HttpArticlesRepository implements ArticlesRepository {
  constructor(private readonly http: AxiosInstance) {}

  async list(params?: ListArticlesParams): Promise<Article[]> {
    const { data } = await this.http.get<ArticlesListDto>('/articles', {
      params: {
        q: params?.q,
        categoryId: params?.categoryId,
        supplierId: params?.supplierId,
        status: params?.status,
      },
    });
    return data.items.map(fromDto);
  }

  async findById(id: string): Promise<Article> {
    const { data } = await this.http.get<ArticleDto>(`/articles/${id}`);
    return fromDto(data);
  }

  async create(payload: CreateArticlePayload): Promise<Article> {
    const { data } = await this.http.post<ArticleDto>('/articles', payload);
    return fromDto(data);
  }

  async update(id: string, payload: UpdateArticlePayload): Promise<Article> {
    const { data } = await this.http.patch<ArticleDto>(`/articles/${id}`, payload);
    return fromDto(data);
  }

  async remove(id: string): Promise<void> {
    await this.http.delete(`/articles/${id}`);
  }

  async getHistory(
    id: string,
    page?: number,
    pageSize?: number,
  ): Promise<ArticleHistoryPage> {
    const { data } = await this.http.get<ArticleHistoryDto>(`/articles/${id}/history`, {
      params: { page, pageSize },
    });
    return data;
  }
}
