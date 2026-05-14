import { httpClient } from '@/data/common/http-client';
import { HttpBulkImportRepository } from '@/data/bulk-import/bulk-import.repository';
import { BulkImportService } from './bulk-import.service';

export * from './bulk-import.repository';
export * from './bulk-import.service';

export const bulkImportService = new BulkImportService(new HttpBulkImportRepository(httpClient));
