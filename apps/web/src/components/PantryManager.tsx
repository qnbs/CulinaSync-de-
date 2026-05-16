import React from 'react';
import { PantryManagerProvider, usePantryManagerContext } from '../contexts/PantryManagerContext';
import { useTranslation } from 'react-i18next';
import { PantryHeader } from './pantry/PantryHeader';
import { PantryToolbar } from './pantry/PantryToolbar';
import { PantryList } from './pantry/PantryList';
import { PantryBulkActions } from './pantry/PantryBulkActions';
import { PantryItemModal } from './pantry/PantryItemModal';
import { PantryQuickAdd } from './pantry/PantryQuickAdd';
import { useModalA11y } from '../hooks/useModalA11y';

const PantryConfirmationModal: React.FC = () => {
  const { t } = useTranslation();
  const { confirmationDialog, confirmPendingAction, cancelPendingAction } = usePantryManagerContext();
  const modalRef = React.useRef<HTMLDivElement>(null);
  const cancelButtonRef = React.useRef<HTMLButtonElement>(null);

  useModalA11y({
    isOpen: Boolean(confirmationDialog),
    onClose: cancelPendingAction,
    containerRef: modalRef,
    initialFocusRef: cancelButtonRef,
  });

  if (!confirmationDialog) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 page-fade-in glass-overlay" onClick={cancelPendingAction}>
      <div ref={modalRef} className="rounded-2xl p-6 w-full max-w-md glass-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="pantry-confirm-title" aria-describedby="pantry-confirm-description" tabIndex={-1}>
        <h3 id="pantry-confirm-title" className="text-lg font-bold text-zinc-100 mb-4">{confirmationDialog.title}</h3>
        <p id="pantry-confirm-description" className="text-sm text-zinc-400 mb-6">{confirmationDialog.description}</p>
        <div className="flex justify-end gap-3">
          <button ref={cancelButtonRef} type="button" onClick={cancelPendingAction} className="px-4 py-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors text-sm font-medium">{t('common.cancel')}</button>
          <button type="button" onClick={() => void confirmPendingAction()} className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 transition-all">{confirmationDialog.actionLabel}</button>
        </div>
      </div>
    </div>
  );
};

const PantryManagerView: React.FC = () => {
  const { modalState, setModalState, handleSaveItem, pantryItems } = usePantryManagerContext();

    return (
        <div className="space-y-8 pb-24">
        {modalState.isOpen && (
          <PantryItemModal 
            key={modalState.item?.id ?? 'new'}
            item={modalState.item}
            onClose={() => setModalState({ isOpen: false, item: null })}
            onSave={handleSaveItem}
            pantryItems={pantryItems || []}
          />
        )}
            <PantryConfirmationModal />
            <PantryHeader />
            <PantryToolbar />
            <div className="space-y-4">
                <PantryList />
                <PantryBulkActions />
            </div>
            <PantryQuickAdd />
        </div>
    );
};

const PantryManager: React.FC = () => {
  return (
    <PantryManagerProvider>
      <PantryManagerView />
    </PantryManagerProvider>
  );
};

export default PantryManager;