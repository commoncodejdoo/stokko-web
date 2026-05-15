import { AxiosInstance } from 'axios';
import {
  ShoppingList,
  ShoppingListItem,
} from '@/domain/shopping-lists/shopping-list.domain';
import {
  AddShoppingListItemPayload,
  CompleteShoppingListResult,
  ShoppingListsRepository,
  UpdateShoppingListItemPayload,
} from '@/domain/shopping-lists/shopping-lists.repository';
import {
  ShoppingListCompletedDto,
  ShoppingListDto,
  ShoppingListItemDto,
} from './shopping-lists.dto';

const fromItemDto = (d: ShoppingListItemDto): ShoppingListItem =>
  new ShoppingListItem(
    d.id,
    d.shoppingListId,
    d.articleId,
    d.warehouseId,
    d.suggestedQty,
    d.customQty,
    d.supplierId,
    d.isChecked,
    d.addedManually,
    d.sortOrder,
    d.estimatedPriceCents,
  );

const fromListDto = (d: ShoppingListDto): ShoppingList =>
  new ShoppingList(
    d.id,
    d.organizationId,
    d.status,
    d.createdById,
    d.completedById,
    d.completedAt,
    d.totalEstimateCents,
    d.currency,
    d.generatedFromSnapshotAt,
    d.note,
    d.createdAt,
    d.updatedAt,
    d.items.map(fromItemDto),
  );

export class HttpShoppingListsRepository implements ShoppingListsRepository {
  constructor(private readonly http: AxiosInstance) {}

  async getActive(): Promise<ShoppingList | null> {
    const { data } = await this.http.get<ShoppingListDto | null>(
      '/shopping-lists/active',
    );
    return data ? fromListDto(data) : null;
  }

  async findById(id: string): Promise<ShoppingList> {
    const { data } = await this.http.get<ShoppingListDto>(`/shopping-lists/${id}`);
    return fromListDto(data);
  }

  async create(): Promise<ShoppingList> {
    const { data } = await this.http.post<ShoppingListDto>('/shopping-lists');
    return fromListDto(data);
  }

  async addItem(
    listId: string,
    payload: AddShoppingListItemPayload,
  ): Promise<ShoppingListItem> {
    const { data } = await this.http.post<ShoppingListItemDto>(
      `/shopping-lists/${listId}/items`,
      payload,
    );
    return fromItemDto(data);
  }

  async updateItem(
    listId: string,
    itemId: string,
    payload: UpdateShoppingListItemPayload,
  ): Promise<ShoppingListItem> {
    const { data } = await this.http.patch<ShoppingListItemDto>(
      `/shopping-lists/${listId}/items/${itemId}`,
      payload,
    );
    return fromItemDto(data);
  }

  async removeItem(listId: string, itemId: string): Promise<void> {
    await this.http.delete(`/shopping-lists/${listId}/items/${itemId}`);
  }

  async complete(listId: string): Promise<CompleteShoppingListResult> {
    const { data } = await this.http.post<ShoppingListCompletedDto>(
      `/shopping-lists/${listId}/complete`,
    );
    const list = fromListDto(data);
    return { list, procurementIds: data.procurementIds };
  }

  async cancel(listId: string): Promise<ShoppingList> {
    const { data } = await this.http.post<ShoppingListDto>(
      `/shopping-lists/${listId}/cancel`,
    );
    return fromListDto(data);
  }
}
