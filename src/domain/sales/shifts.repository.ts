import { Sale } from './sale.domain';
import { Shift } from './shift.domain';

export interface CloseShiftItemPayload {
  articleId: string;
  warehouseId: string;
  /** Decimal string. */
  quantity: string;
}

export interface CloseShiftPayload {
  items: CloseShiftItemPayload[];
}

export interface ListShiftsParams {
  page?: number;
  pageSize?: number;
}

export interface ShiftDetail {
  shift: Shift;
  sales: Sale[];
}

export interface ShiftsRepository {
  list(params?: ListShiftsParams): Promise<{
    items: Shift[];
    pagination: { page: number; pageSize: number; total: number };
  }>;
  findById(id: string): Promise<ShiftDetail>;
  close(payload: CloseShiftPayload): Promise<ShiftDetail>;
  remove(id: string): Promise<void>;
}
