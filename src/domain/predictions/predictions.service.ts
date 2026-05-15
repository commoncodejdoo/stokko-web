import {
  ListPredictionsParams,
  PredictionsRepository,
} from './predictions.repository';

export class PredictionsService {
  constructor(private readonly repo: PredictionsRepository) {}

  listCurrent(params?: ListPredictionsParams) {
    return this.repo.listCurrent(params);
  }

  recompute() {
    return this.repo.recompute();
  }
}
