import { ShiftStatus } from '@/domain/sales/shift.domain';

export interface ShiftDto {
  id: string;
  date: string;
  openedAt: string;
  closedAt: string | null;
  closedById: string | null;
  status: ShiftStatus;
  totalQuantity: string;
  totalRevenue: string;
  currency: string;
}

export interface SaleItemDto {
  id: string;
  articleId: string;
  quantity: string;
  unitPrice: string;
  lineTotal: string;
}

export interface SaleDto {
  id: string;
  shiftId: string;
  warehouseId: string;
  createdById: string;
  createdAt: string;
  currency: string;
  totalQuantity: string;
  totalRevenue: string;
  items: SaleItemDto[];
}

export interface ShiftsListDto {
  items: ShiftDto[];
  pagination: { page: number; pageSize: number; total: number };
}

export type ShiftDetailDto = ShiftDto & { sales: SaleDto[] };
