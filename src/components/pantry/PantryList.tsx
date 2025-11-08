import React from 'react';
import { Info } from 'lucide-react';
import { usePantryManagerContext } from '../../contexts/PantryManagerContext';
import PantryListItem from '../PantryListItem';
import { PantryItem } from '../../types';

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

    const renderItems = (itemsToRender: PantryItem[]) => {
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
    };

    return (
        <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg overflow-hidden">
            {isGrouped && groupedItems ? (
                // FIX: Explicitly type the destructured `items` to fix a TypeScript inference issue where it was being treated as `unknown`.
                Object.entries(groupedItems).sort(([catA], [catB]) => catA.localeCompare(catB)).map(([category, items]: [string, PantryItem[]]) => (
                    <div key={category}>
                        <h4 className="font-bold text-amber-400 bg-zinc-900 px-4 py-2 border-b border-t border-zinc-800 sticky top-0 z-10">{category}</h4>
                        <ul className="divide-y divide-zinc-800">{renderItems(items)}</ul>
                    </div>
                ))
            ) : (
                <ul className="divide-y divide-zinc-800">
                    {filteredItems && filteredItems.length > 0 ? renderItems(filteredItems)
                        : (<li className="p-12 text-center text-zinc-500 space-y-2">
                            <Info size={32} className="mx-auto text-zinc-600"/>
                            <h4 className="font-semibold text-zinc-400">{pantryItems.length ? "Keine Artikel entsprechen deinen Filtern." : "Deine Vorratskammer ist leer."}</h4>
                            <p className="text-sm">{pantryItems.length ? "Versuche, die Filter zu ändern." : "Füge oben deinen ersten Artikel hinzu!"}</p>
                        </li>)
                    }
                </ul>
            )}
        </div>
    );
};