import { AxiosInstance } from 'axios';
import { Warehouse } from '@/domain/warehouses/warehouse.domain';
import {
  CreateWarehousePayload,
  UpdateWarehousePayload,
  WarehouseArticlesPage,
  WarehousesRepository,
} from '@/domain/warehouses/warehouses.repository';
import { WarehouseDto, WarehouseArticlesPageDto, WarehousesListDto } from './warehouses.dto';

const fromDto = (d: WarehouseDto) => new Warehouse(d.id, d.name, d.color, d.initials, d.kind);

export class HttpWarehousesRepository implements WarehousesRepository {
  constructor(private readonly http: AxiosInstance) {}

  async list(): Promise<Warehouse[]> {
    const { data } = await this.http.get<WarehousesListDto>('/warehouses');
    return data.items.map(fromDto);
  }

  async findById(id: string): Promise<Warehouse> {
    const { data } = await this.http.get<WarehouseDto>(`/warehouses/${id}`);
    return fromDto(data);
  }

  async create(payload: CreateWarehousePayload): Promise<Warehouse> {
    const { data } = await this.http.post<WarehouseDto>('/warehouses', payload);
    return fromDto(data);
  }

  async update(id: string, payload: UpdateWarehousePayload): Promise<Warehouse> {
    const { data } = await this.http.patch<WarehouseDto>(`/warehouses/${id}`, payload);
    return fromDto(data);
  }

  async remove(id: string): Promise<void> {
    await this.http.delete(`/warehouses/${id}`);
  }

  async getArticles(id: string): Promise<WarehouseArticlesPage> {
    const { data } = await this.http.get<WarehouseArticlesPageDto>(`/warehouses/${id}/articles`);
    return data;
  }
}
