import { AxiosInstance } from 'axios';
import { StockTransfer } from '@/domain/transfers/stock-transfer.domain';
import {
  CreateTransferPayload,
  ListTransfersParams,
  TransfersRepository,
} from '@/domain/transfers/transfers.repository';
import { StockTransferDto, StockTransfersListDto } from './transfers.dto';

const fromDto = (d: StockTransferDto): StockTransfer =>
  new StockTransfer(
    d.id,
    d.sourceWarehouseId,
    d.destinationWarehouseId,
    d.createdById,
    d.note,
    d.createdAt,
    d.items.map((i) => ({ id: i.id, articleId: i.articleId, quantity: i.quantity })),
  );

export class HttpTransfersRepository implements TransfersRepository {
  constructor(private readonly http: AxiosInstance) {}

  async list(params?: ListTransfersParams) {
    const { data } = await this.http.get<StockTransfersListDto>('/stock/transfers', {
      params,
    });
    return { items: data.items.map(fromDto), pagination: data.pagination };
  }

  async findById(id: string): Promise<StockTransfer> {
    const { data } = await this.http.get<StockTransferDto>(`/stock/transfers/${id}`);
    return fromDto(data);
  }

  async create(payload: CreateTransferPayload): Promise<StockTransfer> {
    const { data } = await this.http.post<StockTransferDto>('/stock/transfers', payload);
    return fromDto(data);
  }
}
