export interface CategoryDto {
  id: string;
  name: string;
  isPredefined: boolean;
}

export interface CategoriesListDto {
  items: CategoryDto[];
}
