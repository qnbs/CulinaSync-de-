import React from 'react';
import { useTranslation } from 'react-i18next';
import { useModalA11y } from '../../hooks/useModalA11y';
import { ShieldAlert } from 'lucide-react';

interface RecipeActionConfirmationModalProps {
  title: string;
  description: string;
  actionLabel: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const RecipeActionConfirmationModal: React.FC<RecipeActionConfirmationModalProps> = ({
  title,
  description,
  actionLabel,
  onClose,
  onConfirm
}) => {
  const { t } = useTranslation();
  const modalRef = React.useRef<HTMLDivElement>(null);
  const cancelButtonRef = React.useRef<HTMLButtonElement>(null);

  useModalA11y({
    isOpen: true,
    onClose,
    containerRef: modalRef,
    initialFocusRef: cancelButtonRef,
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 glass-overlay" onClick={onClose}>
      <div ref={modalRef} className="rounded-lg p-6 w-full max-w-sm glass-modal" onClick={event => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="recipe-action-confirm-title" aria-describedby="recipe-action-confirm-description" tabIndex={-1}>
        <div className="flex items-center gap-3 mb-4 text-red-400">
          <div className="p-2 bg-red-500/10 rounded-full"><ShieldAlert size={22} /></div>
          <h3 id="recipe-action-confirm-title" className="text-lg font-bold text-zinc-100">{title}</h3>
        </div>
        <p id="recipe-action-confirm-description" className="text-sm text-zinc-400 mb-6">{description}</p>
        <div className="flex justify-end gap-3">
          <button ref={cancelButtonRef} type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors text-sm font-medium">{t('common.cancel')}</button>
          <button type="button" onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 flex items-center gap-2 transition-all">
            <ShieldAlert size={16} /> {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};