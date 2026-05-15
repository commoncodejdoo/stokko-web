import {
  AddShoppingListItemPayload,
  ShoppingListsRepository,
  UpdateShoppingListItemPayload,
} from './shopping-lists.repository';

export class ShoppingListsService {
  constructor(private readonly repo: ShoppingListsRepository) {}

  getActive() {
    return this.repo.getActive();
  }

  findById(id: string) {
    return this.repo.findById(id);
  }

  create() {
    return this.repo.create();
  }

  addItem(listId: string, payload: AddShoppingListItemPayload) {
    return this.repo.addItem(listId, payload);
  }

  updateItem(
    listId: string,
    itemId: string,
    payload: UpdateShoppingListItemPayload,
  ) {
    return this.repo.updateItem(listId, itemId, payload);
  }

  removeItem(listId: string, itemId: string) {
    return this.repo.removeItem(listId, itemId);
  }

  complete(listId: string) {
    return this.repo.complete(listId);
  }

  cancel(listId: string) {
    return this.repo.cancel(listId);
  }
}
