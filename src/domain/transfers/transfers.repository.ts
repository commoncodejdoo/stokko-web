import { StockTransfer } from './stock-transfer.domain';

export interface CreateTransferItemPayload {
  articleId: string;
  quantity: string;
}

export interface CreateTransferPayload {
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  note?: string;
  items: CreateTransferItemPayload[];
}

export interface ListTransfersParams {
  warehouseId?: string;
  page?: number;
  pageSize?: number;
}

export interface TransfersRepository {
  list(params?: ListTransfersParams): Promise<{
    items: StockTransfer[];
    pagination: { page: number; pageSize: number; total: number };
  }>;
  findById(id: string): Promise<StockTransfer>;
  create(payload: CreateTransferPayload): Promise<StockTransfer>;
}
