import { StockCorrection } from './correction.domain';
import {
  CorrectionsRepository,
  CreateCorrectionPayload,
  ListCorrectionsParams,
} from './corrections.repository';

export class CorrectionsService {
  constructor(private readonly repo: CorrectionsRepository) {}

  list(params?: ListCorrectionsParams) {
    return this.repo.list(params);
  }

  findById(id: string): Promise<StockCorrection> {
    return this.repo.findById(id);
  }

  create(payload: CreateCorrectionPayload): Promise<StockCorrection> {
    return this.repo.create(payload);
  }
}
