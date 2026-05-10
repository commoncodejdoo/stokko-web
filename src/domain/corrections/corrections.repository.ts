import { CorrectionReason, CorrectionType, StockCorrection } from './correction.domain';

export interface CreateCorrectionPayload {
  articleId: string;
  warehouseId: string;
  type: CorrectionType;
  value: string;
  reason: CorrectionReason;
  note?: string;
}

export interface ListCorrectionsParams {
  articleId?: string;
  warehouseId?: string;
  page?: number;
  pageSize?: number;
}

export interface CorrectionsRepository {
  list(params?: ListCorrectionsParams): Promise<{
    items: StockCorrection[];
    pagination: { page: number; pageSize: number; total: number };
  }>;
  findById(id: string): Promise<StockCorrection>;
  create(payload: CreateCorrectionPayload): Promise<StockCorrection>;
}
