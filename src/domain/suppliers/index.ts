import { httpClient } from '@/data/common/http-client';
import { HttpSuppliersRepository } from '@/data/suppliers/suppliers.repository';
import { SuppliersService } from './suppliers.service';

export * from './supplier.domain';
export * from './suppliers.repository';
export * from './suppliers.service';

export const suppliersService = new SuppliersService(new HttpSuppliersRepository(httpClient));
