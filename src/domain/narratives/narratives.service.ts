import { NarrativesRepository } from './narratives.repository';

export class NarrativesService {
  constructor(private readonly repo: NarrativesRepository) {}

  getDailyDigest(date?: string) {
    return this.repo.getDailyDigest(date);
  }

  explain(articleId: string, warehouseId: string) {
    return this.repo.explain(articleId, warehouseId);
  }
}
