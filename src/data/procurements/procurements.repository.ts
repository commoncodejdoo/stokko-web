import { AxiosInstance } from 'axios';
import { Procurement } from '@/domain/procurements/procurement.domain';
import {
  CreateProcurementPayload,
  ListProcurementsParams,
  ProcurementsRepository,
} from '@/domain/procurements/procurements.repository';
import { ProcurementDto, ProcurementsListDto } from './procurements.dto';

const fromDto = (d: ProcurementDto): Procurement =>
  new Procurement(
    d.id,
    d.supplierId,
    d.warehouseId,
    d.createdById,
    d.note,
    d.createdAt,
    d.currency,
    d.totalValue,
    d.items.map((i) => ({
      id: i.id,
      articleId: i.articleId,
      quantity: i.quantity,
      purchasePrice: i.purchasePrice,
      lineTotal: i.lineTotal,
    })),
  );

export class HttpProcurementsRepository implements ProcurementsRepository {
  constructor(private readonly http: AxiosInstance) {}

  async list(params?: ListProcurementsParams) {
    const { data } = await this.http.get<ProcurementsListDto>('/procurements', { params });
    return {
      items: data.items.map(fromDto),
      pagination: data.pagination,
    };
  }

  async findById(id: string): Promise<Procurement> {
    const { data } = await this.http.get<ProcurementDto>(`/procurements/${id}`);
    return fromDto(data);
  }

  async create(payload: CreateProcurementPayload): Promise<Procurement> {
    const { data } = await this.http.post<ProcurementDto>('/procurements', payload);
    return fromDto(data);
  }
}
