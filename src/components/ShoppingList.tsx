import React from 'react';
import { ShoppingListProvider, useShoppingListContext } from '../contexts/ShoppingListContext';
import { LoaderCircle } from 'lucide-react';
import { AiModal } from './shopping-list/AiModal';
import { BulkAddModal } from './shopping-list/BulkAddModal';
import { ShoppingListToolbar } from './shopping-list/ShoppingListToolbar';
import { ShoppingListContent } from './shopping-list/ShoppingListContent';
import { ShoppingListQuickAdd } from './shopping-list/ShoppingListQuickAdd';

const ShoppingListHeader: React.FC = () => (
    <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Einkaufsliste</h2>
        <p className="text-zinc-400 mt-1">Verwalte, organisiere und übertrage deine Einkäufe.</p>
    </div>
);

const ShoppingListComponent: React.FC = () => {
    const { shoppingList } = useShoppingListContext();

    if (shoppingList === undefined) {
        return <div className="text-center p-12"><LoaderCircle className="mx-auto animate-spin text-amber-500" size={32} /></div>;
    }

    return (
        <div className="space-y-8 pb-24">
            <AiModal />
            <BulkAddModal />
            <ShoppingListHeader />
            <ShoppingListToolbar />
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