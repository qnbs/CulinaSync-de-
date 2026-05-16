import { useRef, useState } from 'react';
import { ShoppingListItem } from '../../types';
import { TextQuote } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { parseShoppingItemString } from '../../services/utils';
import { useShoppingListContext } from '../../contexts/ShoppingListContext';
import { useModalA11y } from '../../hooks/useModalA11y';

export const BulkAddModal = () => {
    const { t } = useTranslation();
    const { isBulkAddModalOpen, setBulkAddModalOpen, handleBulkAdd } = useShoppingListContext();
    const [text, setText] = useState('');
    const [parsedItems, setParsedItems] = useState<Omit<ShoppingListItem, 'id' | 'isChecked' | 'sortOrder' | 'category'>[]>([]);
    const [isParsed, setIsParsed] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLTextAreaElement>(null);

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

    useModalA11y({
        isOpen: isBulkAddModalOpen,
        onClose: handleClose,
        containerRef: modalRef,
        initialFocusRef: textRef,
    });
    
    if (!isBulkAddModalOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 page-fade-in glass-overlay" onClick={handleClose}>
             <div
                ref={modalRef}
            className="rounded-lg p-6 w-full max-w-lg glass-modal"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="bulk-add-title"
                tabIndex={-1}
             >
                 <h3 id="bulk-add-title" className="text-xl font-bold mb-4 flex items-center gap-2"><TextQuote /> {t('shoppingList.bulkAdd.title')}</h3>
                 {!isParsed ? (
                     <>
                        <p className="text-zinc-400 text-sm mb-4">{t('shoppingList.bulkAdd.description')}</p>
                        <textarea ref={textRef} value={text} onChange={e => setText(e.target.value)} placeholder={t('shoppingList.bulkAdd.placeholder')} className="w-full bg-zinc-700 border-zinc-600 rounded-md p-2 h-40 focus:ring-2 focus:ring-amber-500" />
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={handleClose} className="py-2 px-4 rounded-md text-zinc-300 hover:bg-zinc-700">{t('common.cancel')}</button>
                            <button onClick={handleParse} disabled={!text.trim()} className="py-2 px-4 rounded-md bg-amber-500 text-zinc-900 font-bold hover:bg-amber-400 disabled:bg-zinc-600">{t('shoppingList.bulkAdd.analyze')}</button>
                        </div>
                     </>
                 ) : (
                    <>
                        <p className="text-zinc-400 text-sm mb-4">{t('shoppingList.bulkAdd.reviewDescription')}</p>
                        <div className="glass-card rounded-md p-2 max-h-48 overflow-y-auto">
                            <ul>{parsedItems.map((item, i) => <li key={i} className="text-sm p-1"><b>{item.name}</b> ({item.quantity} {item.unit})</li>)}</ul>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={() => setIsParsed(false)} className="py-2 px-4 rounded-md text-zinc-300 hover:bg-zinc-700">{t('shoppingList.bulkAdd.back')}</button>
                            <button onClick={handleAdd} className="py-2 px-4 rounded-md bg-amber-500 text-zinc-900 font-bold hover:bg-amber-400">{t('shoppingList.bulkAdd.addToList')}</button>
                        </div>
                    </>
                 )}
             </div>
        </div>
    );
};