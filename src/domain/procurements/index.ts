import { httpClient } from '@/data/common/http-client';
import { HttpProcurementsRepository } from '@/data/procurements/procurements.repository';
import { ProcurementsService } from './procurements.service';

export * from './procurement.domain';
export * from './procurements.repository';
export * from './procurements.service';

export const procurementsService = new ProcurementsService(
  new HttpProcurementsRepository(httpClient),
);
