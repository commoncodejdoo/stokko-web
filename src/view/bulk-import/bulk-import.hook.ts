import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { bulkImportService, RowError } from '@/domain/bulk-import';
import { toast } from '@/view/common/components/toast.component';

interface ApiErrorBody {
  code?: string;
  message?: string;
  details?: { errors?: RowError[] };
}

export function useDownloadTemplate() {
  return useMutation({
    mutationFn: () => bulkImportService.downloadTemplate(),
    onSuccess: () => {
      toast.success('Predložak preuzet', 'Otvori datoteku, popuni je i uvezi.');
    },
    onError: (err) => {
      toast.error('Greška pri preuzimanju', (err as Error).message);
    },
  });
}

export function useBulkImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => bulkImportService.importFile(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['articles'] });
      qc.invalidateQueries({ queryKey: ['warehouses'] });
      qc.invalidateQueries({ queryKey: ['suppliers'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

/**
 * Extracts the row-level error list from a 422 response if present, so the
 * dialog can render a table of cell errors. Returns null for non-validation
 * errors (network, 5xx) — caller falls back to err.message.
 */
export function extractRowErrors(err: unknown): RowError[] | null {
  if (!(err instanceof AxiosError)) return null;
  const body = err.response?.data as ApiErrorBody | undefined;
  if (body?.code === 'BULK_IMPORT_VALIDATION_FAILED' && body.details?.errors) {
    return body.details.errors;
  }
  return null;
}
