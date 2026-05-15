export type NarrativeKindDto = 'DAILY_DIGEST' | 'ITEM_EXPLANATION' | 'ANOMALY';

export interface RecommendationNarrativeDto {
  id: string;
  kind: NarrativeKindDto;
  body: string;
  articleId: string | null;
  warehouseId: string | null;
  modelUsed: string;
  tokensIn: number;
  tokensOut: number;
  cachedTokens: number;
  costUsd: string;
  validForDate: string | null;
  createdAt: string;
}
