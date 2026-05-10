export interface SupplierDto {
  id: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  note: string | null;
}

export interface SuppliersListDto {
  items: SupplierDto[];
}
