import { httpClient } from '@/data/common/http-client';
import { HttpShoppingListsRepository } from '@/data/shopping-lists/shopping-lists.repository';
import { ShoppingListsService } from './shopping-lists.service';

export * from './shopping-list.domain';
export * from './shopping-lists.repository';
export * from './shopping-lists.service';

export const shoppingListsService = new ShoppingListsService(
  new HttpShoppingListsRepository(httpClient),
);
