import { RecommendationNarrative } from './recommendation-narrative.domain';

export interface NarrativesRepository {
  getDailyDigest(date?: string): Promise<RecommendationNarrative>;
  explain(articleId: string, warehouseId: string): Promise<RecommendationNarrative>;
}
