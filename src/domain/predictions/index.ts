import { httpClient } from '@/data/common/http-client';
import { HttpPredictionsRepository } from '@/data/predictions/predictions.repository';
import { PredictionsService } from './predictions.service';

export * from './prediction-snapshot.domain';
export * from './predictions.repository';
export * from './predictions.service';

export const predictionsService = new PredictionsService(
  new HttpPredictionsRepository(httpClient),
);
