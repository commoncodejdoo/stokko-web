import * as ToastPrimitive from '@radix-ui/react-toast';
import { create } from 'zustand';
import { ReactNode, useEffect } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';
import { cn } from '@/view/common/utils/cn';

type ToastKind = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  kind: ToastKind;
  title: string;
  description?: string;
}

interface ToastState {
  items: ToastItem[];
  push(t: Omit<ToastItem, 'id'>): void;
  dismiss(id: number): void;
}

let nextId = 1;

const useToastStore = create<ToastState>((set) => ({
  items: [],
  push(t) {
    const id = nextId++;
    set((s) => ({ items: [...s.items, { ...t, id }] }));
    // auto-dismiss after 4s — Radix re-uses Open state
    setTimeout(() => {
      set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
    }, 4000);
  },
  dismiss(id) {
    set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
  },
}));

export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().push({ kind: 'success', title, description }),
  error: (title: string, description?: string) =>
    useToastStore.getState().push({ kind: 'error', title, description }),
  info: (title: string, description?: string) =>
    useToastStore.getState().push({ kind: 'info', title, description }),
};

const KIND_STYLE: Record<ToastKind, { bg: string; ring: string; icon: ReactNode }> = {
  success: {
    bg: 'border-success/40',
    ring: 'text-success',
    icon: <CheckCircle size={16} />,
  },
  error: {
    bg: 'border-danger/40',
    ring: 'text-danger',
    icon: <AlertCircle size={16} />,
  },
  info: {
    bg: 'border-accent/40',
    ring: 'text-accent',
    icon: <Info size={16} />,
  },
};

export function ToastViewport({ children }: { children: ReactNode }) {
  const items = useToastStore((s) => s.items);
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    // no-op; included so React keeps the store subscription active
  }, []);

  return (
    <ToastPrimitive.Provider swipeDirection="right" duration={4000}>
      {children}
      {items.map((t) => {
        const style = KIND_STYLE[t.kind];
        return (
          <ToastPrimitive.Root
            key={t.id}
            open
            onOpenChange={(open) => !open && dismiss(t.id)}
            className={cn(
              'bg-card border rounded-lg shadow-lg px-4 py-3 flex items-start gap-3 min-w-[280px] max-w-md',
              style.bg,
              'data-[state=open]:animate-in data-[state=open]:slide-in-from-right',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out',
            )}
          >
            <span className={cn('mt-0.5 shrink-0', style.ring)}>{style.icon}</span>
            <div className="flex-1 min-w-0">
              <ToastPrimitive.Title className="m-0 text-[13px] font-medium">
                {t.title}
              </ToastPrimitive.Title>
              {t.description && (
                <ToastPrimitive.Description className="m-0 mt-0.5 text-2xs text-muted">
                  {t.description}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close asChild>
              <button
                aria-label="Zatvori"
                className="text-muted hover:text-text p-1 -m-1 rounded-md shrink-0"
              >
                <X size={14} />
              </button>
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        );
      })}
      <ToastPrimitive.Viewport className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 outline-none" />
    </ToastPrimitive.Provider>
  );
}
