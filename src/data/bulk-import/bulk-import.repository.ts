import { AxiosInstance } from 'axios';
import {
  BulkImportRepository,
  BulkImportSummary,
} from '@/domain/bulk-import/bulk-import.repository';

export class HttpBulkImportRepository implements BulkImportRepository {
  constructor(private readonly http: AxiosInstance) {}

  async downloadTemplate(): Promise<Blob> {
    const { data } = await this.http.get<Blob>('/bulk-import/template', {
      responseType: 'blob',
      headers: { Accept: '*/*' },
    });
    return data;
  }

  async importFile(file: File): Promise<BulkImportSummary> {
    const form = new FormData();
    form.append('file', file);
    // Let axios set the multipart boundary itself — explicit Content-Type
    // would break the request because the boundary is dynamic.
    const { data } = await this.http.post<BulkImportSummary>('/bulk-import', form, {
      headers: { 'Content-Type': undefined as unknown as string },
    });
    return data;
  }
}
