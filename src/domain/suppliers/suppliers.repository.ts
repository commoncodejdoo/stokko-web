import { Supplier } from './supplier.domain';

export interface CreateSupplierPayload {
  name: string;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  note?: string | null;
}

export interface UpdateSupplierPayload {
  name?: string;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  note?: string | null;
}

export interface SuppliersRepository {
  list(): Promise<Supplier[]>;
  findById(id: string): Promise<Supplier>;
  create(payload: CreateSupplierPayload): Promise<Supplier>;
  update(id: string, payload: UpdateSupplierPayload): Promise<Supplier>;
  remove(id: string): Promise<void>;
}
