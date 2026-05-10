export interface StockTransferItemDto {
  id: string;
  articleId: string;
  quantity: string;
}

export interface StockTransferDto {
  id: string;
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  createdById: string;
  note: string | null;
  createdAt: string;
  items: StockTransferItemDto[];
}

export interface StockTransfersListDto {
  items: StockTransferDto[];
  pagination: { page: number; pageSize: number; total: number };
}
