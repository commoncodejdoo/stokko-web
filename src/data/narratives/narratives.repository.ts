import { AxiosInstance } from 'axios';
import { RecommendationNarrative } from '@/domain/narratives/recommendation-narrative.domain';
import { NarrativesRepository } from '@/domain/narratives/narratives.repository';
import { RecommendationNarrativeDto } from './narratives.dto';

const fromDto = (d: RecommendationNarrativeDto): RecommendationNarrative =>
  new RecommendationNarrative(
    d.id,
    d.kind,
    d.body,
    d.articleId,
    d.warehouseId,
    d.modelUsed,
    d.tokensIn,
    d.tokensOut,
    d.cachedTokens,
    d.costUsd,
    d.validForDate,
    d.createdAt,
  );

export class HttpNarrativesRepository implements NarrativesRepository {
  constructor(private readonly http: AxiosInstance) {}

  async getDailyDigest(date?: string): Promise<RecommendationNarrative> {
    const { data } = await this.http.get<RecommendationNarrativeDto>(
      '/narratives/digest',
      { params: date ? { date } : undefined },
    );
    return fromDto(data);
  }

  async explain(
    articleId: string,
    warehouseId: string,
  ): Promise<RecommendationNarrative> {
    const { data } = await this.http.post<RecommendationNarrativeDto>(
      '/narratives/explain',
      { articleId, warehouseId },
    );
    return fromDto(data);
  }
}
