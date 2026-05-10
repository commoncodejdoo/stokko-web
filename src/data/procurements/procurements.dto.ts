export interface ProcurementItemDto {
  id: string;
  articleId: string;
  quantity: string;
  purchasePrice: string;
  lineTotal: string;
}

export interface ProcurementDto {
  id: string;
  supplierId: string | null;
  warehouseId: string;
  createdById: string;
  note: string | null;
  createdAt: string;
  currency: string;
  totalValue: string;
  items: ProcurementItemDto[];
}

export interface ProcurementsListDto {
  items: ProcurementDto[];
  pagination: { page: number; pageSize: number; total: number };
}
