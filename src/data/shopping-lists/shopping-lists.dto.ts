export type ShoppingListStatusDto =
  | 'DRAFT'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ShoppingListItemDto {
  id: string;
  shoppingListId: string;
  articleId: string;
  warehouseId: string;
  suggestedQty: string;
  customQty: string | null;
  supplierId: string | null;
  isChecked: boolean;
  addedManually: boolean;
  sortOrder: number;
  estimatedPriceCents: number;
}

export interface ShoppingListDto {
  id: string;
  organizationId: string;
  status: ShoppingListStatusDto;
  createdById: string;
  completedById: string | null;
  completedAt: string | null;
  totalEstimateCents: number;
  currency: string;
  generatedFromSnapshotAt: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  items: ShoppingListItemDto[];
}

export interface ShoppingListCompletedDto extends ShoppingListDto {
  procurementIds: string[];
}
