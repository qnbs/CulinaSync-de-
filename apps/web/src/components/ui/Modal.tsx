import React, { useId, useRef, type RefObject } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useModalA11y } from '../../hooks/useModalA11y';
import { cn } from '../../lib/cn';
import { IconButton } from './IconButton';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeClass: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: ModalSize;
  footer?: React.ReactNode;
  hideCloseButton?: boolean;
  className?: string;
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Elevated stacking (e.g. onboarding / what's new) */
  priority?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  footer,
  hideCloseButton = false,
  className,
  initialFocusRef,
  priority = false,
}) => {
  const { t } = useTranslation();
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useModalA11y({ isOpen: open, onClose, containerRef: panelRef, initialFocusRef });

  if (!open) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 flex items-center justify-center p-4 sm:p-6',
        priority ? 'z-[9999]' : 'z-50',
      )}
    >
      <button
        type="button"
        className="absolute inset-0 glass-overlay modal-fade-in"
        aria-label={t('common.close')}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          'relative w-full glass-modal rounded-2xl modal-fade-in shadow-2xl outline-none',
          'max-h-[min(90vh,calc(100dvh-2rem))] flex flex-col',
          sizeClass[size],
          className,
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-white/5 px-6 py-4 shrink-0">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-bold text-zinc-100 tracking-tight">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-1 text-sm text-zinc-400">
                {description}
              </p>
            )}
          </div>
          {!hideCloseButton && (
            <IconButton label={t('common.close')} onClick={onClose} className="shrink-0 -mr-1">
              <X size={20} aria-hidden />
            </IconButton>
          )}
        </header>
        <div className="overflow-y-auto px-6 py-5 flex-1">{children}</div>
        {footer && <footer className="border-t border-white/5 px-6 py-4 shrink-0">{footer}</footer>}
      </div>
    </div>
  );
};
