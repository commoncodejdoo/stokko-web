import { httpClient } from '@/data/common/http-client';
import { HttpCategoriesRepository } from '@/data/categories/categories.repository';
import { CategoriesService } from './categories.service';

export * from './category.domain';
export * from './categories.repository';
export * from './categories.service';

export const categoriesService = new CategoriesService(new HttpCategoriesRepository(httpClient));
