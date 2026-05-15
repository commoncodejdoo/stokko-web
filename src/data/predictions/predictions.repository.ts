import { AxiosInstance } from 'axios';
import {
  PredictionSnapshot,
  PredictionsCurrent,
  RecomputeSummary,
} from '@/domain/predictions/prediction-snapshot.domain';
import {
  ListPredictionsParams,
  PredictionsRepository,
} from '@/domain/predictions/predictions.repository';
import {
  PredictionSnapshotDto,
  PredictionsCurrentDto,
  RecomputeSummaryDto,
} from './predictions.dto';

const fromSnapshot = (d: PredictionSnapshotDto): PredictionSnapshot =>
  new PredictionSnapshot(
    d.id,
    d.warehouseId,
    d.articleId,
    d.currentStock,
    d.avgDailyConsumption,
    d.daysOfSupply,
    d.shouldReorder,
    d.suggestedQty,
    d.urgency,
    d.leadTimeDaysUsed,
    d.safetyDaysUsed,
    d.coverageDaysUsed,
    d.signalWindowDays,
    d.computedAt,
    d.validUntil,
  );

export class HttpPredictionsRepository implements PredictionsRepository {
  constructor(private readonly http: AxiosInstance) {}

  async listCurrent(params?: ListPredictionsParams): Promise<PredictionsCurrent> {
    const { data } = await this.http.get<PredictionsCurrentDto>(
      '/predictions/current',
      {
        params: {
          warehouseId: params?.warehouseId,
          urgency: params?.urgency,
          shouldReorderOnly: params?.shouldReorderOnly ? 'true' : undefined,
        },
      },
    );
    return {
      items: data.items.map(fromSnapshot),
      summary: data.summary,
    };
  }

  async recompute(): Promise<RecomputeSummary> {
    const { data } = await this.http.post<RecomputeSummaryDto>(
      '/predictions/recompute',
    );
    return data;
  }
}
