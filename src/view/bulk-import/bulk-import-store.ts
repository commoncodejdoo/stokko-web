import { create } from 'zustand';

interface BulkImportDialogState {
  open: boolean;
  setOpen(open: boolean): void;
  toggle(): void;
}

export const useBulkImportDialog = create<BulkImportDialogState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((s) => ({ open: !s.open })),
}));
