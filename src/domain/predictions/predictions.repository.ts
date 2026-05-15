import {
  PredictionsCurrent,
  RecomputeSummary,
  Urgency,
} from './prediction-snapshot.domain';

export interface ListPredictionsParams {
  warehouseId?: string;
  urgency?: Urgency;
  shouldReorderOnly?: boolean;
}

export interface PredictionsRepository {
  listCurrent(params?: ListPredictionsParams): Promise<PredictionsCurrent>;
  recompute(): Promise<RecomputeSummary>;
}
