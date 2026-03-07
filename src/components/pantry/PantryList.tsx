import React, { useCallback, useMemo } from 'react';
import { PackageOpen, Layers } from 'lucide-react';
import { VariableSizeList, type ListChildComponentProps } from 'react-window';
import { usePantryManagerContext } from '../../contexts/PantryManagerContext';
import PantryListItem from '../PantryListItem';
import { PantryItem } from '../../types';
import { useWindowSize } from '../../hooks/useWindowSize';

const EmptyState: React.FC<{ totalItemCount: number }> = ({ totalItemCount }) => (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center border-2 border-dashed border-zinc-800/50 rounded-2xl bg-zinc-900/20">
        <div className="bg-zinc-900 p-4 rounded-full mb-4 ring-1 ring-white/5">
            <PackageOpen size={40} className="text-zinc-600"/>
        </div>
        <h3 className="text-xl font-bold text-zinc-300 mb-2">
            {totalItemCount > 0 ? "Keine Ergebnisse gefunden" : "Deine Vorratskammer ist leer"}
        </h3>
        <p className="text-zinc-500 max-w-sm mx-auto leading-relaxed">
            {totalItemCount > 0 
                ? "Versuche, deine Suchbegriffe oder Filter anzupassen." 
                : "Füge deinen ersten Artikel oben rechts hinzu, um den Überblick zu behalten."}
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
    const { width, height } = useWindowSize();

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
    const virtualRows = useMemo(() => {
        if (!hasFilteredContent) {
            return [] as Array<{ type: 'header'; category: string; count: number } | { type: 'item'; item: PantryItem }>;
        }

        if (isGrouped && groupedItems) {
            return Object.entries(groupedItems)
                .sort(([catA], [catB]) => catA.localeCompare(catB))
                .flatMap(([category, items]) => ([
                    { type: 'header' as const, category, count: items.length },
                    ...items.map((item) => ({ type: 'item' as const, item })),
                ]));
        }

        return filteredItems.map((item) => ({ type: 'item' as const, item }));
    }, [filteredItems, groupedItems, hasFilteredContent, isGrouped]);

    const shouldVirtualize = virtualRows.length > 24;
    const listHeight = Math.max(420, Math.min(920, height - 280));
    const listWidth = Math.max(320, width - (width >= 1024 ? 180 : 48));

    const itemData = useMemo(() => ({
        isSelectMode,
        selectedItems,
        setModalState,
        adjustQuantity,
        toggleSelectItem,
        handleAddToShoppingList,
        rows: virtualRows,
    }), [adjustQuantity, handleAddToShoppingList, isSelectMode, selectedItems, setModalState, toggleSelectItem, virtualRows]);

    const getItemSize = useCallback((index: number) => {
        const row = virtualRows[index];
        return row?.type === 'header' ? 62 : 128;
    }, [virtualRows]);

    const Row = ({ index, style, data }: ListChildComponentProps<typeof itemData>) => {
        const row = data.rows[index];
        if (row.type === 'header') {
            return (
                <div style={style} className="px-1 py-2">
                    <h4 className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-accent-400)] uppercase tracking-widest bg-zinc-900/80 border border-[var(--color-accent-500)]/20 px-3 py-1.5 rounded-full shadow-lg">
                        <Layers size={14} />
                        {row.category}
                        <span className="bg-[var(--color-accent-500)]/20 text-[var(--color-accent-300)] px-1.5 py-0.5 rounded text-[10px] ml-1">{row.count}</span>
                    </h4>
                </div>
            );
        }

        return (
            <div style={style} className="px-0.5 py-1.5">
                <PantryListItem
                    item={row.item}
                    isSelectMode={data.isSelectMode}
                    isSelected={data.selectedItems.includes(row.item.id!)}
                    onStartEdit={(itemToEdit) => data.setModalState({ isOpen: true, item: itemToEdit })}
                    onAdjustQuantity={data.adjustQuantity}
                    onToggleSelect={data.toggleSelectItem}
                    onAddToShoppingList={data.handleAddToShoppingList}
                />
            </div>
        );
    };

    return (
        <div className="space-y-8 pb-20" aria-label="Vorratsliste">
            {!hasFilteredContent ? (
                <EmptyState totalItemCount={pantryItems?.length ?? 0} />
            ) : shouldVirtualize ? (
                <div className="rounded-2xl border border-zinc-900/70 bg-zinc-950/30 p-2">
                    <VariableSizeList
                        height={listHeight}
                        itemCount={virtualRows.length}
                        itemData={itemData}
                        itemSize={getItemSize}
                        width={listWidth}
                    >
                        {Row}
                    </VariableSizeList>
                </div>
            ) : isGrouped && groupedItems ? (
                Object.entries(groupedItems).sort(([catA], [catB]) => catA.localeCompare(catB)).map(([category, items]: [string, PantryItem[]]) => (
                    <div key={category} className="relative">
                        <div className="sticky top-36 z-20 py-3 px-1 -mx-1 bg-gradient-to-b from-zinc-950 via-zinc-950/95 to-transparent backdrop-blur-sm mb-2">
                             <h4 className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-accent-400)] uppercase tracking-widest bg-zinc-900/80 border border-[var(--color-accent-500)]/20 px-3 py-1.5 rounded-full shadow-lg">
                                <Layers size={14} />
                                {category} 
                                <span className="bg-[var(--color-accent-500)]/20 text-[var(--color-accent-300)] px-1.5 py-0.5 rounded text-[10px] ml-1">{items.length}</span>
                             </h4>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {renderItems(items)}
                        </div>
                    </div>
                ))
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {renderItems(filteredItems)}
                </div>
            )}
        </div>
    );
};