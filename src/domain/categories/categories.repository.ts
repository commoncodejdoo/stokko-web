import { Category } from './category.domain';

export interface CategoriesRepository {
  list(): Promise<Category[]>;
}
