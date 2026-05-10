import { Procurement } from './procurement.domain';

export interface CreateProcurementItemPayload {
  articleId: string;
  quantity: string;
  purchasePrice: string;
}

export interface CreateProcurementPayload {
  supplierId?: string | null;
  warehouseId: string;
  note?: string;
  items: CreateProcurementItemPayload[];
}

export interface ListProcurementsParams {
  supplierId?: string;
  warehouseId?: string;
  createdSince?: string;
  page?: number;
  pageSize?: number;
}

export interface ProcurementsRepository {
  list(params?: ListProcurementsParams): Promise<{
    items: Procurement[];
    pagination: { page: number; pageSize: number; total: number };
  }>;
  findById(id: string): Promise<Procurement>;
  create(payload: CreateProcurementPayload): Promise<Procurement>;
}
