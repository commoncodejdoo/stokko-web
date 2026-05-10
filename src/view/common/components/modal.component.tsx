import * as Dialog from '@radix-ui/react-dialog';
import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/view/common/utils/cn';

interface ModalProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZE: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
            'w-[92vw] bg-card border border-border rounded-lg shadow-xl',
            'max-h-[90vh] flex flex-col',
            SIZE[size],
          )}
        >
          <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border">
            <div className="min-w-0">
              <Dialog.Title className="m-0 text-[15px] font-semibold truncate">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="m-0 mt-1 text-2xs text-muted">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Zatvori"
                className="text-muted hover:text-text p-1 -m-1 rounded-md"
              >
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>
          <div className="px-5 py-4 overflow-y-auto flex-1">{children}</div>
          {footer && (
            <div className="px-5 py-3 border-t border-border flex justify-end gap-2">{footer}</div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
