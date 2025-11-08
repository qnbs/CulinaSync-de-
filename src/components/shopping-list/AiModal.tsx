import React, { useState } from 'react';
import { ShoppingListItem } from '../../types';
import { generateShoppingList } from '../../services/geminiService';
import { Bot, LoaderCircle, ArrowLeft, CheckSquare, Square } from 'lucide-react';
import { useShoppingListContext } from '../../contexts/ShoppingListContext';

export const AiModal = () => {
    const { isAiModalOpen, setAiModalOpen, handleAiAdd, pantryItems, activeItems } = useShoppingListContext();

    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [reviewItems, setReviewItems] = useState<Omit<ShoppingListItem, 'id' | 'isChecked' | 'sortOrder'>[] | null>(null);
    const [selectedItems, setSelectedItems] = useState<Map<string, boolean>>(new Map());

    const handleGenerate = async () => {
        setIsLoading(true);
        setError('');
        try {
            const items = await generateShoppingList(prompt, pantryItems, activeItems);
            setReviewItems(items);
            setSelectedItems(new Map(items.map(item => [item.name, true])));
        } catch (err: any) {
            setError(err.message || 'Liste konnte nicht generiert werden. Bitte versuche es erneut.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleItem = (itemName: string) => {
        const newSelected = new Map(selectedItems);
        newSelected.set(itemName, !newSelected.get(itemName));
        setSelectedItems(newSelected);
    };

    const handleAddSelected = () => {
        if (!reviewItems) return;
        const itemsToAdd = reviewItems.filter(item => selectedItems.get(item.name));
        handleAiAdd(itemsToAdd.map(({ category, ...rest }) => rest));
        handleClose();
    };
    
    const handleClose = () => {
        setPrompt('');
        setIsLoading(false);
        setError('');
        setReviewItems(null);
        setSelectedItems(new Map());
        setAiModalOpen(false);
    }

    if (!isAiModalOpen) return null;

    const selectedCount = Array.from(selectedItems.values()).filter(Boolean).length;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 page-fade-in" onClick={handleClose}>
            <div className="bg-zinc-800 rounded-lg p-6 w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Bot /> KI-gestützte Einkaufsliste</h3>
                {!reviewItems ? (
                    <>
                        <p className="text-zinc-400 text-sm mb-4">Beschreibe, was du vorhast (z.B. "Grillparty für 6 Personen" oder "Zutaten für Lasagne"), und die KI erstellt eine passende Einkaufsliste für dich. Dein aktueller Vorrat wird dabei berücksichtigt.</p>
                        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="z.B. Zutaten für einen Schokoladenkuchen..." className="w-full bg-zinc-700 border-zinc-600 rounded-md p-2 h-24 focus:ring-2 focus:ring-[var(--color-accent-500)]" />
                        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={handleClose} className="py-2 px-4 rounded-md text-zinc-300 hover:bg-zinc-700">Abbrechen</button>
                            <button onClick={handleGenerate} disabled={!prompt.trim() || isLoading} className="py-2 px-4 rounded-md bg-[var(--color-accent-500)] text-zinc-900 font-bold hover:bg-[var(--color-accent-400)] disabled:bg-zinc-600 flex items-center gap-2">
                                {isLoading ? <><LoaderCircle size={18} className="animate-spin"/> Generiere...</> : 'Liste erstellen'}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-zinc-400 text-sm mb-4">Überprüfe die Vorschläge der KI. Entferne Artikel, die du nicht benötigst.</p>
                        <div className="bg-zinc-900 rounded-md p-2 max-h-60 overflow-y-auto border border-zinc-700 space-y-1">
                            {reviewItems.map(item => (
                                <div key={item.name} onClick={() => handleToggleItem(item.name)} className="flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-zinc-800">
                                    {selectedItems.get(item.name) ? <CheckSquare className="text-[var(--color-accent-400)]"/> : <Square className="text-zinc-500"/>}
                                    <span className="flex-grow">{item.name}</span>
                                    <span className="text-zinc-400 text-sm">({item.quantity} {item.unit})</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between items-center gap-3 pt-4">
                            <button type="button" onClick={() => setReviewItems(null)} className="py-2 px-4 rounded-md text-zinc-300 hover:bg-zinc-700 flex items-center gap-2"><ArrowLeft size={16} /> Zurück</button>
                            <button onClick={handleAddSelected} disabled={selectedCount === 0} className="py-2 px-4 rounded-md bg-[var(--color-accent-500)] text-zinc-900 font-bold hover:bg-[var(--color-accent-400)] disabled:bg-zinc-600 flex items-center gap-2">
                                {selectedCount} Artikel hinzufügen
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};