import {
  BulkImportRepository,
  BulkImportSummary,
} from './bulk-import.repository';

const TEMPLATE_FILENAME = 'stokko-predlozak.xlsx';

export class BulkImportService {
  constructor(private readonly repo: BulkImportRepository) {}

  async downloadTemplate(): Promise<void> {
    const blob = await this.repo.downloadTemplate();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = TEMPLATE_FILENAME;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Defer revoke to the next tick so the browser can complete the download.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  importFile(file: File): Promise<BulkImportSummary> {
    return this.repo.importFile(file);
  }
}
