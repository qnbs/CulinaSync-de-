import React, { useRef, useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useModalA11y } from '../../../../hooks/useModalA11y';

interface ResetConfirmationModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetConfirmationModal: React.FC<ResetConfirmationModalProps> = ({ onClose, onConfirm }) => {
  const { t } = useTranslation();
  const [confirmationText, setConfirmationText] = useState('');
  const CONFIRMATION_KEYWORD = t('settings.data.reset.confirmationKeyword');
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useModalA11y({
    isOpen: true,
    onClose,
    containerRef: modalRef,
    initialFocusRef: inputRef,
  });

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 page-fade-in glass-overlay"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="rounded-2xl p-6 w-full max-w-md glass-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-confirmation-title"
        tabIndex={-1}
      >
        <div className="flex items-center gap-3 text-red-500 mb-4">
          <div className="p-2 bg-red-500/10 rounded-full">
            <AlertTriangle size={24} />
          </div>
          <h3 id="reset-confirmation-title" className="text-lg font-bold">
            {t('settings.data.reset.title')}
          </h3>
        </div>
        <p className="text-zinc-400 text-sm mb-6">{t('settings.data.reset.description')}</p>
        <input
          ref={inputRef}
          type="text"
          value={confirmationText}
          onChange={(e) => setConfirmationText(e.target.value)}
          placeholder={t('settings.data.reset.placeholder', { keyword: CONFIRMATION_KEYWORD })}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 focus:ring-2 focus:ring-red-500 focus:outline-none font-mono text-center uppercase"
        />
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl text-zinc-400 hover:bg-zinc-800 font-medium"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmationText !== CONFIRMATION_KEYWORD}
            className="py-2.5 px-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
          >
            <Trash2 size={16} /> {t('settings.data.reset.action')}
          </button>
        </div>
      </div>
    </div>
  );
};
