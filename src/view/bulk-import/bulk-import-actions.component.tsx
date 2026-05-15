import { ReactNode } from 'react';
import { Download, Upload } from 'lucide-react';
import { Button } from '@/view/common/components/button.component';
import { useAuthStore } from '@/view/common/store/auth-store';
import { canEditCatalog } from '@/domain/common/role';
import { useBulkImportDialog } from './bulk-import-store';
import { useDownloadTemplate } from './bulk-import.hook';

interface BulkImportActionsProps {
  /** Action rendered after the import buttons (typically the "Novi X" primary CTA). */
  trailing?: ReactNode;
}

/**
 * Renders "Predložak" + "Uvezi Excel" buttons followed by an optional
 * primary action. Hidden for users without catalog edit permissions.
 *
 * Drop this into a `<PageHeader actions={...}>` on any list screen
 * (articles, warehouses, suppliers, …). All three buttons remain in a
 * single horizontal row and the dialog opens through the global store
 * mounted in AppShell.
 */
export function BulkImportActions({ trailing }: BulkImportActionsProps) {
  const role = useAuthStore((s) => s.user?.role);
  const canImport = role ? canEditCatalog(role) : false;
  const openImport = useBulkImportDialog((s) => s.setOpen);
  const downloadTemplate = useDownloadTemplate();

  if (!canImport) return trailing ? <>{trailing}</> : null;

  return (
    <div className="flex items-center gap-2">
      <Button
        icon={<Download size={14} />}
        onClick={() => downloadTemplate.mutate()}
        loading={downloadTemplate.isPending}
      >
        Predložak
      </Button>
      <Button icon={<Upload size={14} />} onClick={() => openImport(true)}>
        Uvezi Excel
      </Button>
      {trailing}
    </div>
  );
}
