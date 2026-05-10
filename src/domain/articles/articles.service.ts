import { Article } from './article.domain';
import {
  ArticleHistoryPage,
  ArticlesRepository,
  CreateArticlePayload,
  ListArticlesParams,
  UpdateArticlePayload,
} from './articles.repository';

export class ArticlesService {
  constructor(private readonly repo: ArticlesRepository) {}

  list(params?: ListArticlesParams): Promise<Article[]> {
    return this.repo.list(params);
  }

  findById(id: string): Promise<Article> {
    return this.repo.findById(id);
  }

  create(payload: CreateArticlePayload): Promise<Article> {
    return this.repo.create(payload);
  }

  update(id: string, payload: UpdateArticlePayload): Promise<Article> {
    return this.repo.update(id, payload);
  }

  remove(id: string): Promise<void> {
    return this.repo.remove(id);
  }

  getHistory(id: string, page?: number, pageSize?: number): Promise<ArticleHistoryPage> {
    return this.repo.getHistory(id, page, pageSize);
  }
}
