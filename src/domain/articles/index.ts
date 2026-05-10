import { httpClient } from '@/data/common/http-client';
import { HttpArticlesRepository } from '@/data/articles/articles.repository';
import { ArticlesService } from './articles.service';

export * from './article.domain';
export * from './articles.repository';
export * from './articles.service';

export const articlesService = new ArticlesService(new HttpArticlesRepository(httpClient));
