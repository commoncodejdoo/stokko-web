import { httpClient } from '@/data/common/http-client';
import { HttpShiftsRepository } from '@/data/sales/shifts.repository';
import { ShiftsService } from './shifts.service';

export * from './shift.domain';
export * from './sale.domain';
export * from './shifts.repository';
export * from './shifts.service';

export const shiftsService = new ShiftsService(new HttpShiftsRepository(httpClient));
