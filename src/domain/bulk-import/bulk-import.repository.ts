export interface EntityCount {
  created: number;
  skipped: number;
}

export interface BulkImportSummary {
  categories: EntityCount;
  warehouses: EntityCount;
  suppliers: EntityCount;
  articles: EntityCount;
}

export interface RowError {
  sheet: string;
  row: number;
  field: string;
  message: string;
}

export interface BulkImportRepository {
  downloadTemplate(): Promise<Blob>;
  importFile(file: File): Promise<BulkImportSummary>;
}
