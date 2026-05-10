import { AxiosInstance } from 'axios';
import { StockCorrection } from '@/domain/corrections/correction.domain';
import {
  CorrectionsRepository,
  CreateCorrectionPayload,
  ListCorrectionsParams,
} from '@/domain/corrections/corrections.repository';
import { CorrectionDto, CorrectionsListDto } from './corrections.dto';

const fromDto = (d: CorrectionDto): StockCorrection =>
  new StockCorrection(
    d.id,
    d.articleId,
    d.warehouseId,
    d.type,
    d.value,
    d.reason,
    d.note,
    d.createdById,
    d.createdAt,
  );

export class HttpCorrectionsRepository implements CorrectionsRepository {
  constructor(private readonly http: AxiosInstance) {}

  async list(params?: ListCorrectionsParams) {
    const { data } = await this.http.get<CorrectionsListDto>('/stock/corrections', { params });
    return {
      items: data.items.map(fromDto),
      pagination: data.pagination,
    };
  }

  async findById(id: string): Promise<StockCorrection> {
    const { data } = await this.http.get<CorrectionDto>(`/stock/corrections/${id}`);
    return fromDto(data);
  }

  async create(payload: CreateCorrectionPayload): Promise<StockCorrection> {
    const { data } = await this.http.post<CorrectionDto>('/stock/corrections', payload);
    return fromDto(data);
  }
}
