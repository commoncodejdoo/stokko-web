import {
  CloseShiftPayload,
  ListShiftsParams,
  ShiftDetail,
  ShiftsRepository,
} from './shifts.repository';
import { Shift } from './shift.domain';

export class ShiftsService {
  constructor(private readonly repo: ShiftsRepository) {}

  list(params?: ListShiftsParams): Promise<{
    items: Shift[];
    pagination: { page: number; pageSize: number; total: number };
  }> {
    return this.repo.list(params);
  }

  findById(id: string): Promise<ShiftDetail> {
    return this.repo.findById(id);
  }

  close(payload: CloseShiftPayload): Promise<ShiftDetail> {
    return this.repo.close(payload);
  }

  remove(id: string): Promise<void> {
    return this.repo.remove(id);
  }
}
