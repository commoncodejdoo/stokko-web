import { AxiosInstance } from 'axios';
import { Category } from '@/domain/categories/category.domain';
import {
  CategoriesRepository,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '@/domain/categories/categories.repository';
import { CategoriesListDto, CategoryDto } from './categories.dto';

const fromDto = (d: CategoryDto): Category => new Category(d.id, d.name, d.isPredefined);

export class HttpCategoriesRepository implements CategoriesRepository {
  constructor(private readonly http: AxiosInstance) {}

  async list(): Promise<Category[]> {
    const { data } = await this.http.get<CategoriesListDto>('/categories');
    return data.items.map(fromDto);
  }

  async create(payload: CreateCategoryPayload): Promise<Category> {
    const { data } = await this.http.post<CategoryDto>('/categories', payload);
    return fromDto(data);
  }

  async update(id: string, payload: UpdateCategoryPayload): Promise<Category> {
    const { data } = await this.http.patch<CategoryDto>(`/categories/${id}`, payload);
    return fromDto(data);
  }

  async remove(id: string): Promise<void> {
    await this.http.delete(`/categories/${id}`);
  }
}
