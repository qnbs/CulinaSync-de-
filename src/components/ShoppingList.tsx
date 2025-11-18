import React, { useEffect } from 'react';
import { ShoppingListProvider, useShoppingListContext } from '../contexts/ShoppingListContext';
import { LoaderCircle } from 'lucide-react';
import { AiModal } from './shopping-list/AiModal';
import { BulkAddModal } from './shopping-list/BulkAddModal';
import { ShoppingListToolbar } from './shopping-list/ShoppingListToolbar';
import { ShoppingListContent } from './shopping-list/ShoppingListContent';
import { ShoppingListQuickAdd } from './shopping-list/ShoppingListQuickAdd';
import { ShoppingListHeader } from './shopping-list/ShoppingListHeader';
import { useWakeLock } from '../hooks/useWakeLock';

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