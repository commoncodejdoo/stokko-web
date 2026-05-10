import { Supplier } from './supplier.domain';
import {
  CreateSupplierPayload,
  SuppliersRepository,
  UpdateSupplierPayload,
} from './suppliers.repository';

export class SuppliersService {
  constructor(private readonly repo: SuppliersRepository) {}

  list(): Promise<Supplier[]> {
    return this.repo.list();
  }

  findById(id: string): Promise<Supplier> {
    return this.repo.findById(id);
  }

  create(payload: CreateSupplierPayload): Promise<Supplier> {
    return this.repo.create(payload);
  }

  update(id: string, payload: UpdateSupplierPayload): Promise<Supplier> {
    return this.repo.update(id, payload);
  }

  remove(id: string): Promise<void> {
    return this.repo.remove(id);
  }
}
