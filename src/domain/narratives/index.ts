import { httpClient } from '@/data/common/http-client';
import { HttpNarrativesRepository } from '@/data/narratives/narratives.repository';
import { NarrativesService } from './narratives.service';

export * from './recommendation-narrative.domain';
export * from './narratives.repository';
export * from './narratives.service';

export const narrativesService = new NarrativesService(
  new HttpNarrativesRepository(httpClient),
);
