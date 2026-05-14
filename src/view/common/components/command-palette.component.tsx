import { useEffect } from 'react';
import { create } from 'zustand';
import { useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { Command } from 'cmdk';
import {
  Search,
  Plus,
  Edit3,
  Warehouse as WarehouseIcon,
  Package,
  Building2,
  Truck,
  Home,
  Users as UsersIcon,
  Settings as SettingsIcon,
  Upload,
  Download,
} from 'lucide-react';
import { useArticles } from '@/view/articles/articles.hook';
import { useWarehouses } from '@/view/warehouses/warehouses.hook';
import { useSuppliers } from '@/view/suppliers/suppliers.hook';
import { useProcurements } from '@/view/procurements/procurements.hook';
import { useAuthStore } from '@/view/common/store/auth-store';
import { canEditCatalog } from '@/domain/common/role';
import { useBulkImportDialog } from '@/view/bulk-import/bulk-import-store';
import { useDownloadTemplate } from '@/view/bulk-import/bulk-import.hook';
import { cn } from '@/view/common/utils/cn';

interface CommandPaletteState {
  open: boolean;
  setOpen(open: boolean): void;
  toggle(): void;
}

export const useCommandPalette = create<CommandPaletteState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((s) => ({ open: !s.open })),
}));

/**
 * Registers a global ⌘K / Ctrl+K shortcut. Mount once near the app root.
 */
export function useCommandPaletteShortcut() {
  const toggle = useCommandPalette((s) => s.toggle);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggle]);
}

export function CommandPalette() {
  const navigate = useNavigate();
  const open = useCommandPalette((s) => s.open);
  const setOpen = useCommandPalette((s) => s.setOpen);

  const role = useAuthStore((s) => s.user?.role);
  const canImport = role ? canEditCatalog(role) : false;
  const openImport = useBulkImportDialog((s) => s.setOpen);
  const downloadTemplate = useDownloadTemplate();

  const articles = useArticles();
  const warehouses = useWarehouses();
  const suppliers = useSuppliers();
  const procurements = useProcurements({ pageSize: 5 });

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            'fixed left-1/2 top-[20%] -translate-x-1/2 z-50',
            'w-[92vw] max-w-[640px] bg-card border border-border rounded-lg shadow-xl',
            'overflow-hidden',
          )}
        >
          <Dialog.Title className="sr-only">Brza pretraga</Dialog.Title>
          <Command className="flex flex-col" shouldFilter>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <Search size={16} className="text-muted shrink-0" />
              <Command.Input
                autoFocus
                placeholder="Pretraži artikle, skladišta, dobavljače, nabave…"
                className="flex-1 bg-transparent border-none outline-none text-text text-[14px] placeholder:text-muted"
              />
              <kbd className="font-mono text-2xs px-1.5 py-0.5 bg-card-hi border border-border rounded-sm text-muted">
                Esc
              </kbd>
            </div>

            <Command.List className="max-h-[400px] overflow-y-auto py-2 scrollbar-thin">
              <Command.Empty className="px-4 py-8 text-center text-2xs text-muted">
                Nema rezultata.
              </Command.Empty>

              <CmdGroup heading="Brze akcije">
                <CmdItem
                  value="nova nabava primka"
                  icon={<Plus size={14} />}
                  onSelect={() => go('/procurements/new')}
                >
                  Nova nabava
                </CmdItem>
                <CmdItem
                  value="korekcija zalihe stanje"
                  icon={<Edit3 size={14} />}
                  onSelect={() => go('/corrections')}
                >
                  Korekcija zaliha
                </CmdItem>
                {canImport && (
                  <>
                    <CmdItem
                      value="uvezi excel xlsx artikli kategorije skladista dobavljaci import"
                      icon={<Upload size={14} />}
                      onSelect={() => {
                        setOpen(false);
                        openImport(true);
                      }}
                    >
                      Uvezi Excel
                    </CmdItem>
                    <CmdItem
                      value="preuzmi excel predlozak template download"
                      icon={<Download size={14} />}
                      onSelect={() => {
                        setOpen(false);
                        downloadTemplate.mutate();
                      }}
                    >
                      Preuzmi Excel predložak
                    </CmdItem>
                  </>
                )}
              </CmdGroup>

              <CmdGroup heading="Navigacija">
                <CmdItem value="pocetna dashboard home" icon={<Home size={14} />} onSelect={() => go('/')}>
                  Početna
                </CmdItem>
                <CmdItem
                  value="skladista warehouses"
                  icon={<WarehouseIcon size={14} />}
                  onSelect={() => go('/warehouses')}
                >
                  Skladišta
                </CmdItem>
                <CmdItem value="artikli items" icon={<Package size={14} />} onSelect={() => go('/articles')}>
                  Artikli
                </CmdItem>
                <CmdItem
                  value="dobavljaci suppliers"
                  icon={<Building2 size={14} />}
                  onSelect={() => go('/suppliers')}
                >
                  Dobavljači
                </CmdItem>
                <CmdItem
                  value="primke nabave procurements"
                  icon={<Truck size={14} />}
                  onSelect={() => go('/procurements')}
                >
                  Nabave
                </CmdItem>
                <CmdItem
                  value="korisnici users team"
                  icon={<UsersIcon size={14} />}
                  onSelect={() => go('/users')}
                >
                  Korisnici
                </CmdItem>
                <CmdItem
                  value="postavke settings"
                  icon={<SettingsIcon size={14} />}
                  onSelect={() => go('/settings')}
                >
                  Postavke
                </CmdItem>
              </CmdGroup>

              {articles.data && articles.data.length > 0 && (
                <CmdGroup heading="Artikli">
                  {articles.data.slice(0, 8).map((a) => (
                    <CmdItem
                      key={a.id}
                      value={`${a.name} ${a.sku}`}
                      icon={<Package size={14} />}
                      onSelect={() => go(`/articles/${a.id}`)}
                      meta={a.sku}
                    >
                      {a.name}
                    </CmdItem>
                  ))}
                </CmdGroup>
              )}

              {warehouses.data && warehouses.data.length > 0 && (
                <CmdGroup heading="Skladišta">
                  {warehouses.data.map((w) => (
                    <CmdItem
                      key={w.id}
                      value={w.name}
                      icon={
                        <span
                          style={{ background: w.color }}
                          className="size-3 rounded-sm shrink-0"
                        />
                      }
                      onSelect={() => go(`/warehouses/${w.id}`)}
                    >
                      {w.name}
                    </CmdItem>
                  ))}
                </CmdGroup>
              )}

              {suppliers.data && suppliers.data.length > 0 && (
                <CmdGroup heading="Dobavljači">
                  {suppliers.data.slice(0, 8).map((s) => (
                    <CmdItem
                      key={s.id}
                      value={s.name}
                      icon={<Building2 size={14} />}
                      onSelect={() => go(`/suppliers`)}
                    >
                      {s.name}
                    </CmdItem>
                  ))}
                </CmdGroup>
              )}

              {procurements.data && procurements.data.items.length > 0 && (
                <CmdGroup heading="Nedavne nabave">
                  {procurements.data.items.slice(0, 5).map((p) => (
                    <CmdItem
                      key={p.id}
                      value={`${p.id} nabava ${new Date(p.createdAt).toLocaleDateString('hr-HR')}`}
                      icon={<Truck size={14} />}
                      onSelect={() => go(`/procurements/${p.id}`)}
                      meta={new Date(p.createdAt).toLocaleDateString('hr-HR')}
                    >
                      <span className="font-mono text-2xs">
                        {p.id.slice(0, 8).toUpperCase()}
                      </span>
                    </CmdItem>
                  ))}
                </CmdGroup>
              )}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CmdGroup({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <Command.Group
      heading={heading}
      className="px-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-2xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
    >
      {children}
    </Command.Group>
  );
}

interface CmdItemProps {
  value: string;
  icon?: React.ReactNode;
  meta?: string;
  onSelect(): void;
  children: React.ReactNode;
}

function CmdItem({ value, icon, meta, onSelect, children }: CmdItemProps) {
  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      className="px-2 py-2 rounded-md text-[13px] flex items-center gap-2.5 cursor-pointer data-[selected=true]:bg-card-hi data-[selected=true]:text-text text-text"
    >
      {icon && <span className="text-muted shrink-0">{icon}</span>}
      <span className="flex-1 truncate">{children}</span>
      {meta && <span className="text-2xs text-muted shrink-0">{meta}</span>}
    </Command.Item>
  );
}
