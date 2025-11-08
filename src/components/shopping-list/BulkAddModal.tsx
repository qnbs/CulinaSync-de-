import React, { useState } from 'react';
import { ShoppingListItem } from '../../types';
import { TextQuote } from 'lucide-react';
import { parseShoppingItemString } from '../../services/utils';
import { useShoppingListContext } from '../../contexts/ShoppingListContext';

export const BulkAddModal = () => {
    const { isBulkAddModalOpen, setBulkAddModalOpen, handleBulkAdd } = useShoppingListContext();
    const [text, setText] = useState('');
    const [parsedItems, setParsedItems] = useState<Omit<ShoppingListItem, 'id' | 'isChecked' | 'sortOrder' | 'category'>[]>([]);
    const [isParsed, setIsParsed] = useState(false);

    const handleParse = () => {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const items = lines.map(line => parseShoppingItemString(line));
        setParsedItems(items);
        setIsParsed(true);
    };

    const handleAdd = () => {
        handleBulkAdd(parsedItems);
        handleClose();
    };

    const handleClose = () => {
        setText(''); setParsedItems([]); setIsParsed(false); setBulkAddModalOpen(false);
    };
    
    if (!isBulkAddModalOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 page-fade-in" onClick={handleClose}>
             <div className="bg-zinc-800 rounded-lg p-6 w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
                 <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><TextQuote /> Liste einfügen</h3>
                 {!isParsed ? (
                     <>
                        <p className="text-zinc-400 text-sm mb-4">Füge eine Liste von Zutaten ein, einen Artikel pro Zeile. Mengen und Einheiten werden automatisch erkannt.</p>
                        <textarea value={text} onChange={e => setText(e.target.value)} placeholder={"250g Mehl\n1 Prise Salz\nEier"} className="w-full bg-zinc-700 border-zinc-600 rounded-md p-2 h-40 focus:ring-2 focus:ring-amber-500" />
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={handleClose} className="py-2 px-4 rounded-md text-zinc-300 hover:bg-zinc-700">Abbrechen</button>
                            <button onClick={handleParse} disabled={!text.trim()} className="py-2 px-4 rounded-md bg-amber-500 text-zinc-900 font-bold hover:bg-amber-400 disabled:bg-zinc-600">Analysieren</button>
                        </div>
                     </>
                 ) : (
                    <>
                        <p className="text-zinc-400 text-sm mb-4">Überprüfe die erkannten Artikel. Du kannst sie nach dem Hinzufügen noch bearbeiten.</p>
                        <div className="bg-zinc-900 rounded-md p-2 max-h-48 overflow-y-auto border border-zinc-700">
                            <ul>{parsedItems.map((item, i) => <li key={i} className="text-sm p-1"><b>{item.name}</b> ({item.quantity} {item.unit})</li>)}</ul>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={() => setIsParsed(false)} className="py-2 px-4 rounded-md text-zinc-300 hover:bg-zinc-700">Zurück</button>
                            <button onClick={handleAdd} className="py-2 px-4 rounded-md bg-amber-500 text-zinc-900 font-bold hover:bg-amber-400">Zur Liste hinzufügen</button>
                        </div>
                    </>
                 )}
             </div>
        </div>
    );
};