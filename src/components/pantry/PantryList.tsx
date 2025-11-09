import React, { useCallback } from 'react';
import { Info } from 'lucide-react';
import { usePantryManagerContext } from '../../contexts/PantryManagerContext';
import PantryListItem from '../PantryListItem';
import { PantryItem } from '../../types';

const EmptyState: React.FC<{ totalItemCount: number }> = ({ totalItemCount }) => (
    <div className="p-12 text-center text-zinc-500 space-y-2" role="status">
        <Info size={32} className="mx-auto text-zinc-600"/>
        <h4 className="font-semibold text-zinc-400">
            {totalItemCount > 0 ? "Keine Artikel entsprechen deinen Filtern." : "Deine Vorratskammer ist leer."}
        </h4>
        <p className="text-sm">
            {totalItemCount > 0 ? "Versuche, die Filter zu ändern." : "Füge oben deinen ersten Artikel hinzu!"}
        </p>
    </div>
);

export const PantryList = () => {
    const {
        groupedItems,
        filteredItems,
        isGrouped,
        pantryItems,
        isSelectMode,
        selectedItems,
        setModalState,
        adjustQuantity,
        toggleSelectItem,
        handleAddToShoppingList,
    } = usePantryManagerContext();

    const renderItems = useCallback((itemsToRender: PantryItem[]) => {
        return itemsToRender.map(item => (
            <PantryListItem
                key={item.id}
                item={item}
                isSelectMode={isSelectMode}
                isSelected={selectedItems.includes(item.id!)}
                onStartEdit={(itemToEdit) => setModalState({ isOpen: true, item: itemToEdit })}
                onAdjustQuantity={adjustQuantity}
                onToggleSelect={toggleSelectItem}
                onAddToShoppingList={handleAddToShoppingList}
            />
        ));
    }, [isSelectMode, selectedItems, setModalState, adjustQuantity, toggleSelectItem, handleAddToShoppingList]);

    const hasFilteredContent = (isGrouped && groupedItems && Object.keys(groupedItems).length > 0) || (!isGrouped && filteredItems && filteredItems.length > 0);

    return (
        <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg overflow-hidden" aria-label="Vorratsliste">
            {!hasFilteredContent ? (
                // FIX: pantryItems can be undefined. Use optional chaining and nullish coalescing operator.
                <EmptyState totalItemCount={pantryItems?.length ?? 0} />
            ) : isGrouped && groupedItems ? (
                Object.entries(groupedItems).sort(([catA], [catB]) => catA.localeCompare(catB)).map(([category, items]: [string, PantryItem[]]) => (
                    <div key={category}>
                        <h4 className="font-bold text-amber-400 bg-zinc-900 px-4 py-2 border-b border-t border-zinc-800 sticky top-0 z-10">{category}</h4>
                        <ul className="divide-y divide-zinc-800">{renderItems(items)}</ul>
                    </div>
                ))
            ) : (
                <ul className="divide-y divide-zinc-800">
                    {renderItems(filteredItems)}
                </ul>
            )}
        </div>
    );
};