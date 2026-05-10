import { Procurement } from './procurement.domain';
import {
  CreateProcurementPayload,
  ListProcurementsParams,
  ProcurementsRepository,
} from './procurements.repository';

export class ProcurementsService {
  constructor(private readonly repo: ProcurementsRepository) {}

  list(params?: ListProcurementsParams) {
    return this.repo.list(params);
  }

  findById(id: string): Promise<Procurement> {
    return this.repo.findById(id);
  }

  create(payload: CreateProcurementPayload): Promise<Procurement> {
    return this.repo.create(payload);
  }
}
