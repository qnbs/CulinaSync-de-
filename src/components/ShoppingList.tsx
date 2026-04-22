import React, { useEffect } from 'react';
import { ShoppingListProvider, useShoppingListContext } from '../contexts/ShoppingListContext';
import { LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AiModal } from './shopping-list/AiModal';
import { BulkAddModal } from './shopping-list/BulkAddModal';
import { ShoppingListToolbar } from './shopping-list/ShoppingListToolbar';
import { ShoppingListContent } from './shopping-list/ShoppingListContent';
import { ShoppingListQuickAdd } from './shopping-list/ShoppingListQuickAdd';
import { ShoppingListHeader } from './shopping-list/ShoppingListHeader';
import { useWakeLock } from '../hooks/useWakeLock';
import { useModalA11y } from '../hooks/useModalA11y';

const ShoppingListConfirmationModal: React.FC = () => {
    const { t } = useTranslation();
    const { confirmationDialog, confirmPendingAction, cancelPendingAction } = useShoppingListContext();
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
            <div ref={modalRef} className="rounded-2xl p-6 w-full max-w-md glass-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="shopping-list-confirm-title" aria-describedby="shopping-list-confirm-description" tabIndex={-1}>
                <h3 id="shopping-list-confirm-title" className="text-lg font-bold text-zinc-100 mb-4">{confirmationDialog.title}</h3>
                <p id="shopping-list-confirm-description" className="text-sm text-zinc-400 mb-6">{confirmationDialog.description}</p>
                <div className="flex justify-end gap-3">
                    <button ref={cancelButtonRef} type="button" onClick={cancelPendingAction} className="px-4 py-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors text-sm font-medium">{t('common.cancel')}</button>
                    <button type="button" onClick={() => void confirmPendingAction()} className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 transition-all">{confirmationDialog.actionLabel}</button>
                </div>
            </div>
        </div>
    );
};

const ShoppingListComponent: React.FC = () => {
    const { shoppingList, isShoppingMode } = useShoppingListContext();
    const [, requestWakeLock, releaseWakeLock] = useWakeLock();

    useEffect(() => {
        if (isShoppingMode) {
            requestWakeLock();
        } else {
            releaseWakeLock();
        }
        return () => { releaseWakeLock(); }
    }, [isShoppingMode, requestWakeLock, releaseWakeLock]);

    if (shoppingList === undefined) {
        return <div className="text-center p-12"><LoaderCircle className="mx-auto animate-spin text-[var(--color-accent-500)]" size={32} /></div>;
    }

    return (
        <div className={`space-y-8 pb-32 ${isShoppingMode ? 'max-w-3xl mx-auto' : ''}`}>
            <AiModal />
            <BulkAddModal />
            <ShoppingListConfirmationModal />
            
            <ShoppingListHeader />
            
            {!isShoppingMode && <ShoppingListToolbar />}
            
            <ShoppingListContent />
            
            <ShoppingListQuickAdd />
        </div>
    );
};

const ShoppingList: React.FC = () => (
    <ShoppingListProvider>
        <ShoppingListComponent />
    </ShoppingListProvider>
);

export default ShoppingList;