export type NarrativeKind = 'DAILY_DIGEST' | 'ITEM_EXPLANATION' | 'ANOMALY';

export class RecommendationNarrative {
  constructor(
    readonly id: string,
    readonly kind: NarrativeKind,
    readonly body: string,
    readonly articleId: string | null,
    readonly warehouseId: string | null,
    readonly modelUsed: string,
    readonly tokensIn: number,
    readonly tokensOut: number,
    readonly cachedTokens: number,
    readonly costUsd: string,
    readonly validForDate: string | null,
    readonly createdAt: string,
  ) {}
}
