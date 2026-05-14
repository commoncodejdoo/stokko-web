import { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, FileSpreadsheet, Download, CheckCircle, AlertTriangle } from 'lucide-react';
import { Modal } from '@/view/common/components/modal.component';
import { Button } from '@/view/common/components/button.component';
import { Spinner } from '@/view/common/components/spinner.component';
import type { BulkImportSummary, RowError } from '@/domain/bulk-import';
import { cn } from '@/view/common/utils/cn';
import { useBulkImport, useDownloadTemplate, extractRowErrors } from './bulk-import.hook';
import { useBulkImportDialog } from './bulk-import-store';

const MAX_BYTES = 2 * 1024 * 1024;

type View = 'idle' | 'loading' | 'success' | 'errors';

export function BulkImportDialog() {
  const open = useBulkImportDialog((s) => s.open);
  const setOpen = useBulkImportDialog((s) => s.setOpen);
  const importMut = useBulkImport();
  const downloadMut = useDownloadTemplate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [view, setView] = useState<View>('idle');
  const [summary, setSummary] = useState<BulkImportSummary | null>(null);
  const [rowErrors, setRowErrors] = useState<RowError[]>([]);
  const [genericError, setGenericError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Reset state every time the dialog opens.
  useEffect(() => {
    if (open) {
      setView('idle');
      setSummary(null);
      setRowErrors([]);
      setGenericError(null);
      setDragOver(false);
    }
  }, [open]);

  const handleFile = useCallback(
    async (file: File) => {
      setGenericError(null);
      setRowErrors([]);

      if (!file.name.toLowerCase().endsWith('.xlsx')) {
        setGenericError('Datoteka mora biti .xlsx.');
        setView('errors');
        return;
      }
      if (file.size > MAX_BYTES) {
        setGenericError(`Datoteka je veća od ${Math.round(MAX_BYTES / 1024 / 1024)} MB.`);
        setView('errors');
        return;
      }

      setView('loading');
      try {
        const result = await importMut.mutateAsync(file);
        setSummary(result);
        setView('success');
      } catch (err) {
        const rowErrs = extractRowErrors(err);
        if (rowErrs && rowErrs.length > 0) {
          setRowErrors(rowErrs);
          setView('errors');
        } else {
          setGenericError(
            err instanceof Error ? err.message : 'Nepoznata greška pri uvozu.',
          );
          setView('errors');
        }
      }
    },
    [importMut],
  );

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = '';
  };

  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      title="Uvezi Excel"
      description="Masovni uvoz artikala, kategorija, skladišta i dobavljača."
      size="lg"
      footer={
        <>
          <Button onClick={() => setOpen(false)} disabled={view === 'loading'}>
            Zatvori
          </Button>
          {view !== 'loading' && (
            <Button
              variant="ghost"
              icon={<Download size={14} />}
              onClick={() => downloadMut.mutate()}
              loading={downloadMut.isPending}
            >
              Preuzmi predložak
            </Button>
          )}
        </>
      }
    >
      {view === 'idle' && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-lg px-6 py-12 text-center cursor-pointer transition-colors',
            dragOver
              ? 'border-accent bg-accent/5'
              : 'border-border hover:border-accent/60 hover:bg-card-hi',
          )}
        >
          <FileSpreadsheet size={32} className="mx-auto text-muted mb-3" />
          <div className="text-[14px] font-medium mb-1">
            Povuci .xlsx datoteku ovdje
          </div>
          <div className="text-2xs text-muted">
            ili klikni za odabir · max 2 MB
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={onSelect}
          />
          <div className="mt-6 text-2xs text-muted">
            Nemaš predložak? Klikni{' '}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                downloadMut.mutate();
              }}
              className="text-accent hover:underline"
            >
              Preuzmi predložak
            </button>{' '}
            ispod.
          </div>
        </div>
      )}

      {view === 'loading' && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner />
          <div className="text-2xs text-muted">Uvozim podatke…</div>
        </div>
      )}

      {view === 'success' && summary && (
        <div>
          <div className="flex items-start gap-3 mb-5">
            <CheckCircle size={20} className="text-success shrink-0 mt-0.5" />
            <div>
              <div className="text-[14px] font-medium">Uvoz uspješan</div>
              <div className="text-2xs text-muted mt-0.5">
                Sve novo dodano, postojeći zapisi su preskočeni.
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SummaryCard label="Kategorije" entity={summary.categories} />
            <SummaryCard label="Skladišta" entity={summary.warehouses} />
            <SummaryCard label="Dobavljači" entity={summary.suppliers} />
            <SummaryCard label="Artikli" entity={summary.articles} />
          </div>
        </div>
      )}

      {view === 'errors' && (
        <div>
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle size={20} className="text-danger shrink-0 mt-0.5" />
            <div>
              <div className="text-[14px] font-medium">Uvoz neuspješan</div>
              <div className="text-2xs text-muted mt-0.5">
                {genericError ?? `${rowErrors.length} pogreška u datoteci. Ispravi i pokušaj ponovno.`}
              </div>
            </div>
          </div>
          {rowErrors.length > 0 && (
            <div className="border border-border rounded-md overflow-hidden">
              <table className="w-full text-2xs">
                <thead className="bg-card-hi text-muted">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">List</th>
                    <th className="text-left px-3 py-2 font-medium w-12">Red</th>
                    <th className="text-left px-3 py-2 font-medium">Polje</th>
                    <th className="text-left px-3 py-2 font-medium">Poruka</th>
                  </tr>
                </thead>
                <tbody className="max-h-[300px] overflow-y-auto block sm:table-row-group">
                  {rowErrors.slice(0, 100).map((err, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-3 py-1.5">{err.sheet}</td>
                      <td className="px-3 py-1.5 tabular-nums">{err.row}</td>
                      <td className="px-3 py-1.5">{err.field}</td>
                      <td className="px-3 py-1.5 text-danger">{err.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rowErrors.length > 100 && (
                <div className="text-center text-2xs text-muted py-2 border-t border-border">
                  …još {rowErrors.length - 100} grešaka. Ispravi prvih 100 i pokušaj ponovno.
                </div>
              )}
            </div>
          )}
          <div className="mt-4">
            <Button
              variant="ghost"
              icon={<Upload size={14} />}
              onClick={() => setView('idle')}
            >
              Pokušaj ponovno
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function SummaryCard({
  label,
  entity,
}: {
  label: string;
  entity: { created: number; skipped: number };
}) {
  return (
    <div className="border border-border rounded-md px-3 py-2.5 bg-card-hi">
      <div className="text-2xs text-muted">{label}</div>
      <div className="mt-1 text-[13px]">
        <span className="font-medium text-success tabular-nums">{entity.created}</span>
        <span className="text-muted"> novih</span>
        {entity.skipped > 0 && (
          <>
            <span className="text-muted"> · </span>
            <span className="text-muted tabular-nums">{entity.skipped}</span>
            <span className="text-muted"> preskočeno</span>
          </>
        )}
      </div>
    </div>
  );
}
