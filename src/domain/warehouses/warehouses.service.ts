import { Warehouse } from './warehouse.domain';
import {
  CreateWarehousePayload,
  UpdateWarehousePayload,
  WarehouseArticlesPage,
  WarehousesRepository,
} from './warehouses.repository';

export class WarehousesService {
  constructor(private readonly repo: WarehousesRepository) {}

  list(): Promise<Warehouse[]> {
    return this.repo.list();
  }

  findById(id: string): Promise<Warehouse> {
    return this.repo.findById(id);
  }

  create(payload: CreateWarehousePayload): Promise<Warehouse> {
    return this.repo.create(payload);
  }

  update(id: string, payload: UpdateWarehousePayload): Promise<Warehouse> {
    return this.repo.update(id, payload);
  }

  remove(id: string): Promise<void> {
    return this.repo.remove(id);
  }

  getArticles(id: string): Promise<WarehouseArticlesPage> {
    return this.repo.getArticles(id);
  }
}
