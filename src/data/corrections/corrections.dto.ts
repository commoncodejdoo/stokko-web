import { CorrectionReason, CorrectionType } from '@/domain/corrections/correction.domain';

export interface CorrectionDto {
  id: string;
  articleId: string;
  warehouseId: string;
  type: CorrectionType;
  value: string;
  reason: CorrectionReason;
  note: string | null;
  createdById: string;
  createdAt: string;
}

export interface CorrectionsListDto {
  items: CorrectionDto[];
  pagination: { page: number; pageSize: number; total: number };
}
