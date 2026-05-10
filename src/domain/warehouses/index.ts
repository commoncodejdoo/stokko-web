import { httpClient } from '@/data/common/http-client';
import { HttpWarehousesRepository } from '@/data/warehouses/warehouses.repository';
import { WarehousesService } from './warehouses.service';

export * from './warehouse.domain';
export * from './warehouses.repository';
export * from './warehouses.service';

export const warehousesService = new WarehousesService(new HttpWarehousesRepository(httpClient));
