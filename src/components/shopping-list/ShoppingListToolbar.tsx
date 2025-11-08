import React from 'react';
import { useShoppingListContext } from '../../contexts/ShoppingListContext';
import { FileDown, Bot, TextQuote, RefreshCw, Trash2, ListTree, ListCollapse, ChevronDown, LoaderCircle } from 'lucide-react';

export const ShoppingListToolbar = () => {
    const {
        shoppingList,
        isExportOpen,
        setExportOpen,
        handleExport,
        handleClearList,
        setAiModalOpen,
        setBulkAddModalOpen,
        handleGenerateFromPlan,
        isGenerating,
        expandAll,
        collapseAll,
    } = useShoppingListContext();

    return (
        <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-4 space-y-4">
            <div className="flex flex-wrap gap-2 justify-between items-center">
                <div className="flex items-center gap-2">
                    <button onClick={expandAll} className="flex items-center gap-2 p-2 rounded-md bg-zinc-700 text-sm hover:bg-zinc-600" title="Alle ausklappen"><ListTree size={16}/></button>
                    <button onClick={collapseAll} className="flex items-center gap-2 p-2 rounded-md bg-zinc-700 text-sm hover:bg-zinc-600" title="Alle einklappen"><ListCollapse size={16}/></button>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                    <button onClick={handleGenerateFromPlan} disabled={isGenerating} className="flex items-center gap-2 bg-zinc-700 font-semibold py-2 px-3 rounded-md hover:bg-zinc-600 text-sm disabled:bg-zinc-800 disabled:text-zinc-500">
                        {isGenerating ? <LoaderCircle size={16} className="animate-spin"/> : <RefreshCw size={16}/>} Aus Plan generieren
                    </button>
                    <button onClick={() => setBulkAddModalOpen(true)} className="flex items-center gap-2 bg-zinc-700 font-semibold py-2 px-3 rounded-md hover:bg-zinc-600 text-sm"><TextQuote size={16}/> Liste einfügen</button>
                    <button onClick={() => setAiModalOpen(true)} className="flex items-center gap-2 bg-zinc-700 font-semibold py-2 px-3 rounded-md hover:bg-zinc-600 text-sm"><Bot size={16} /> KI-Liste</button>
                    <div className="relative inline-block">
                        <button onClick={() => setExportOpen(!isExportOpen)} className="w-full flex items-center gap-2 bg-zinc-700 font-semibold py-2 px-3 rounded-md hover:bg-zinc-600 text-sm">
                            <FileDown size={16} /> Exportieren <ChevronDown size={16} className={`transition-transform ${isExportOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isExportOpen && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg z-10">
                                <a onClick={() => handleExport('pdf')} className="block text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer">PDF (.pdf)</a>
                                <a onClick={() => handleExport('csv')} className="block text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer">CSV (.csv)</a>
                                <a onClick={() => handleExport('json')} className="block text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer">JSON (.json)</a>
                                <a onClick={() => handleExport('md')} className="block text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer">Markdown (.md)</a>
                                <a onClick={() => handleExport('txt')} className="block text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer">Text (.txt)</a>
                            </div>
                        )}
                    </div>
                    <button onClick={handleClearList} disabled={!shoppingList || shoppingList.length === 0} className="flex items-center gap-2 bg-red-900/80 font-semibold py-2 px-3 rounded-md hover:bg-red-800 disabled:bg-zinc-800 disabled:text-zinc-500 text-sm"><Trash2 size={16}/> Leeren</button>
                </div>
            </div>
        </div>
    );
};