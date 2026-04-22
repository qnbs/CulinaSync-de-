import { useShoppingListContext } from '../../contexts/ShoppingListContext';
import { ShoppingCart, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ShoppingListActive } from './ShoppingListActive';
import { ShoppingListCompleted } from './ShoppingListCompleted';

export const ShoppingListContent = () => {
    const { t } = useTranslation();
    const { shoppingList, activeItems, completedItems } = useShoppingListContext();

    if (!shoppingList || shoppingList.length === 0) {
        return (
            <div className="text-center py-20 bg-zinc-950/50 border border-dashed border-zinc-700 rounded-lg">
                <ShoppingCart className="mx-auto h-12 w-12 text-zinc-600" />
                <h3 className="mt-4 text-lg font-medium text-zinc-300">{t('shoppingList.empty.title')}</h3>
                <p className="mt-1 text-sm text-zinc-500 max-w-md mx-auto">
                    {t('shoppingList.empty.description')}
                </p>
            </div>
        );
    }
    
    return (
        <div className="space-y-4">
            {activeItems.length > 0 && <ShoppingListActive />}
            
            {completedItems.length > 0 && <ShoppingListCompleted />}

            {activeItems.length === 0 && completedItems.length > 0 && (
                <div className="text-center py-20 bg-zinc-950/50 border border-dashed border-zinc-700 rounded-lg">
                    <CheckCircle className="mx-auto h-12 w-12 text-zinc-600" />
                    <h3 className="mt-4 text-lg font-medium text-zinc-300">{t('shoppingList.completed.title')}</h3>
                    <p className="mt-1 text-sm text-zinc-500">{t('shoppingList.completed.description')}</p>
                </div>
            )}
        </div>
    );
};