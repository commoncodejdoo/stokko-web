import { ShoppingList, ShoppingListItem } from './shopping-list.domain';

export interface AddShoppingListItemPayload {
  articleId: string;
  warehouseId: string;
  customQty?: string;
  supplierId?: string | null;
}

export interface UpdateShoppingListItemPayload {
  customQty?: string | null;
  supplierId?: string | null;
  isChecked?: boolean;
}

export interface CompleteShoppingListResult {
  list: ShoppingList;
  procurementIds: string[];
}

export interface ShoppingListsRepository {
  getActive(): Promise<ShoppingList | null>;
  findById(id: string): Promise<ShoppingList>;
  create(): Promise<ShoppingList>;
  addItem(
    listId: string,
    payload: AddShoppingListItemPayload,
  ): Promise<ShoppingListItem>;
  updateItem(
    listId: string,
    itemId: string,
    payload: UpdateShoppingListItemPayload,
  ): Promise<ShoppingListItem>;
  removeItem(listId: string, itemId: string): Promise<void>;
  complete(listId: string): Promise<CompleteShoppingListResult>;
  cancel(listId: string): Promise<ShoppingList>;
}
