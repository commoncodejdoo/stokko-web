import { AxiosInstance } from 'axios';
import { Supplier } from '@/domain/suppliers/supplier.domain';
import {
  CreateSupplierPayload,
  SuppliersRepository,
  UpdateSupplierPayload,
} from '@/domain/suppliers/suppliers.repository';
import { SupplierDto, SuppliersListDto } from './suppliers.dto';

const fromDto = (d: SupplierDto): Supplier =>
  new Supplier(d.id, d.name, d.contactPerson, d.phone, d.email, d.note);

export class HttpSuppliersRepository implements SuppliersRepository {
  constructor(private readonly http: AxiosInstance) {}

  async list(): Promise<Supplier[]> {
    const { data } = await this.http.get<SuppliersListDto>('/suppliers');
    return data.items.map(fromDto);
  }

  async findById(id: string): Promise<Supplier> {
    const { data } = await this.http.get<SupplierDto>(`/suppliers/${id}`);
    return fromDto(data);
  }

  async create(payload: CreateSupplierPayload): Promise<Supplier> {
    const { data } = await this.http.post<SupplierDto>('/suppliers', payload);
    return fromDto(data);
  }

  async update(id: string, payload: UpdateSupplierPayload): Promise<Supplier> {
    const { data } = await this.http.patch<SupplierDto>(`/suppliers/${id}`, payload);
    return fromDto(data);
  }

  async remove(id: string): Promise<void> {
    await this.http.delete(`/suppliers/${id}`);
  }
}
