import { AxiosInstance } from 'axios';
import { Shift } from '@/domain/sales/shift.domain';
import { Sale } from '@/domain/sales/sale.domain';
import {
  CloseShiftPayload,
  ListShiftsParams,
  ShiftDetail,
  ShiftsRepository,
} from '@/domain/sales/shifts.repository';
import {
  SaleDto,
  ShiftDetailDto,
  ShiftDto,
  ShiftsListDto,
} from './shifts.dto';

const shiftFromDto = (d: ShiftDto): Shift =>
  new Shift(
    d.id,
    d.date,
    d.openedAt,
    d.closedAt,
    d.closedById,
    d.status,
    d.totalQuantity,
    d.totalRevenue,
    d.currency,
  );

const saleFromDto = (d: SaleDto): Sale =>
  new Sale(
    d.id,
    d.shiftId,
    d.warehouseId,
    d.createdById,
    d.createdAt,
    d.currency,
    d.totalQuantity,
    d.totalRevenue,
    d.items.map((i) => ({
      id: i.id,
      articleId: i.articleId,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      lineTotal: i.lineTotal,
    })),
  );

export class HttpShiftsRepository implements ShiftsRepository {
  constructor(private readonly http: AxiosInstance) {}

  async list(params?: ListShiftsParams) {
    const { data } = await this.http.get<ShiftsListDto>('/shifts', { params });
    return { items: data.items.map(shiftFromDto), pagination: data.pagination };
  }

  async findById(id: string): Promise<ShiftDetail> {
    const { data } = await this.http.get<ShiftDetailDto>(`/shifts/${id}`);
    const { sales, ...shift } = data;
    return {
      shift: shiftFromDto(shift),
      sales: sales.map(saleFromDto),
    };
  }

  async close(payload: CloseShiftPayload): Promise<ShiftDetail> {
    const { data } = await this.http.post<ShiftDetailDto>('/shifts/close', payload);
    const { sales, ...shift } = data;
    return {
      shift: shiftFromDto(shift),
      sales: sales.map(saleFromDto),
    };
  }

  async remove(id: string): Promise<void> {
    await this.http.delete(`/shifts/${id}`);
  }
}
