import { StockTransfer } from './stock-transfer.domain';
import {
  CreateTransferPayload,
  ListTransfersParams,
  TransfersRepository,
} from './transfers.repository';

export class TransfersService {
  constructor(private readonly repo: TransfersRepository) {}

  list(params?: ListTransfersParams) {
    return this.repo.list(params);
  }

  findById(id: string): Promise<StockTransfer> {
    return this.repo.findById(id);
  }

  create(payload: CreateTransferPayload): Promise<StockTransfer> {
    return this.repo.create(payload);
  }
}
