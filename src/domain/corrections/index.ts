import { httpClient } from '@/data/common/http-client';
import { HttpCorrectionsRepository } from '@/data/corrections/corrections.repository';
import { CorrectionsService } from './corrections.service';

export * from './correction.domain';
export * from './corrections.repository';
export * from './corrections.service';

export const correctionsService = new CorrectionsService(new HttpCorrectionsRepository(httpClient));
