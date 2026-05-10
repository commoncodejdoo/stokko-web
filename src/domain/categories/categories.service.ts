import { Category } from './category.domain';
import {
  CategoriesRepository,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from './categories.repository';

export class CategoriesService {
  constructor(private readonly repo: CategoriesRepository) {}

  list(): Promise<Category[]> {
    return this.repo.list();
  }

  create(payload: CreateCategoryPayload): Promise<Category> {
    return this.repo.create(payload);
  }

  update(id: string, payload: UpdateCategoryPayload): Promise<Category> {
    return this.repo.update(id, payload);
  }

  remove(id: string): Promise<void> {
    return this.repo.remove(id);
  }
}
