export type ShoppingListStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED';

export class ShoppingListItem {
  constructor(
    readonly id: string,
    readonly shoppingListId: string,
    readonly articleId: string,
    readonly warehouseId: string,
    readonly suggestedQty: string,
    readonly customQty: string | null,
    readonly supplierId: string | null,
    readonly isChecked: boolean,
    readonly addedManually: boolean,
    readonly sortOrder: number,
    readonly estimatedPriceCents: number,
  ) {}

  effectiveQty(): string {
    return this.customQty ?? this.suggestedQty;
  }
}

export class ShoppingList {
  constructor(
    readonly id: string,
    readonly organizationId: string,
    readonly status: ShoppingListStatus,
    readonly createdById: string,
    readonly completedById: string | null,
    readonly completedAt: string | null,
    readonly totalEstimateCents: number,
    readonly currency: string,
    readonly generatedFromSnapshotAt: string | null,
    readonly note: string | null,
    readonly createdAt: string,
    readonly updatedAt: string,
    readonly items: ShoppingListItem[],
  ) {}

  isActive(): boolean {
    return this.status === 'DRAFT' || this.status === 'ACTIVE';
  }

  checkedItems(): ShoppingListItem[] {
    return this.items.filter((it) => it.isChecked);
  }

  checkedTotalCents(): number {
    return this.checkedItems().reduce(
      (acc, it) => acc + it.estimatedPriceCents,
      0,
    );
  }
}
