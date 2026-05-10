import { Category } from './category.domain';

export interface CreateCategoryPayload {
  name: string;
}

export interface UpdateCategoryPayload {
  name?: string;
}

export interface CategoriesRepository {
  list(): Promise<Category[]>;
  create(payload: CreateCategoryPayload): Promise<Category>;
  update(id: string, payload: UpdateCategoryPayload): Promise<Category>;
  remove(id: string): Promise<void>;
}
