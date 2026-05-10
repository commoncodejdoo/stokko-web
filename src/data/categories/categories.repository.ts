import { AxiosInstance } from 'axios';
import { Category } from '@/domain/categories/category.domain';
import { CategoriesRepository } from '@/domain/categories/categories.repository';
import { CategoriesListDto } from './categories.dto';

export class HttpCategoriesRepository implements CategoriesRepository {
  constructor(private readonly http: AxiosInstance) {}

  async list(): Promise<Category[]> {
    const { data } = await this.http.get<CategoriesListDto>('/categories');
    return data.items.map((c) => new Category(c.id, c.name, c.isPredefined));
  }
}
