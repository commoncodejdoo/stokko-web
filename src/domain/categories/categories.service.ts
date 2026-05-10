import { Category } from './category.domain';
import { CategoriesRepository } from './categories.repository';

export class CategoriesService {
  constructor(private readonly repo: CategoriesRepository) {}

  list(): Promise<Category[]> {
    return this.repo.list();
  }
}
