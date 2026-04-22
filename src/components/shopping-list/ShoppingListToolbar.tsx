import { useShoppingListContext } from '../../contexts/ShoppingListContext';
import { FileDown, Bot, TextQuote, RefreshCw, Trash2, ListTree, ListCollapse, ChevronDown, LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const ShoppingListToolbar = () => {
    const { t } = useTranslation();
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
                    <button type="button" aria-label={t('shoppingList.toolbar.expandAllAria')} onClick={expandAll} className="flex items-center gap-2 p-2 rounded-md bg-zinc-700 text-sm hover:bg-zinc-600" title={t('shoppingList.toolbar.expandAllTitle')}><ListTree size={16}/></button>
                    <button type="button" aria-label={t('shoppingList.toolbar.collapseAllAria')} onClick={collapseAll} className="flex items-center gap-2 p-2 rounded-md bg-zinc-700 text-sm hover:bg-zinc-600" title={t('shoppingList.toolbar.collapseAllTitle')}><ListCollapse size={16}/></button>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                    <button type="button" onClick={handleGenerateFromPlan} disabled={isGenerating} className="flex items-center gap-2 bg-zinc-700 font-semibold py-2 px-3 rounded-md hover:bg-zinc-600 text-sm disabled:bg-zinc-800 disabled:text-zinc-500">
                        {isGenerating ? <LoaderCircle size={16} className="animate-spin"/> : <RefreshCw size={16}/>} {t('shoppingList.toolbar.generateFromPlan')}
                    </button>
                    <button type="button" onClick={() => setBulkAddModalOpen(true)} className="flex items-center gap-2 bg-zinc-700 font-semibold py-2 px-3 rounded-md hover:bg-zinc-600 text-sm"><TextQuote size={16}/> {t('shoppingList.toolbar.pasteList')}</button>
                    <button type="button" onClick={() => setAiModalOpen(true)} className="flex items-center gap-2 bg-zinc-700 font-semibold py-2 px-3 rounded-md hover:bg-zinc-600 text-sm"><Bot size={16} /> {t('shoppingList.toolbar.aiList')}</button>
                    <div className="relative inline-block">
                        <button type="button" aria-haspopup="menu" aria-expanded={isExportOpen} onClick={() => setExportOpen(!isExportOpen)} className="w-full flex items-center gap-2 bg-zinc-700 font-semibold py-2 px-3 rounded-md hover:bg-zinc-600 text-sm">
                            <FileDown size={16} /> {t('shoppingList.toolbar.export')} <ChevronDown size={16} className={`transition-transform ${isExportOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isExportOpen && (
                            <div role="menu" className="absolute top-full right-0 mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg z-10">
                                <button type="button" role="menuitem" onClick={() => handleExport('pdf')} className="block w-full text-left text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer">{t('shoppingList.toolbar.exportPdf')}</button>
                                <button type="button" role="menuitem" onClick={() => handleExport('csv')} className="block w-full text-left text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer">{t('shoppingList.toolbar.exportCsv')}</button>
                                <button type="button" role="menuitem" onClick={() => handleExport('json')} className="block w-full text-left text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer">{t('shoppingList.toolbar.exportJson')}</button>
                                <button type="button" role="menuitem" onClick={() => handleExport('md')} className="block w-full text-left text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer">{t('shoppingList.toolbar.exportMarkdown')}</button>
                                <button type="button" role="menuitem" onClick={() => handleExport('txt')} className="block w-full text-left text-sm px-4 py-2 hover:bg-zinc-700 cursor-pointer">{t('shoppingList.toolbar.exportText')}</button>
                            </div>
                        )}
                    </div>
                    <button type="button" onClick={handleClearList} disabled={!shoppingList || shoppingList.length === 0} className="flex items-center gap-2 bg-red-900/80 font-semibold py-2 px-3 rounded-md hover:bg-red-800 disabled:bg-zinc-800 disabled:text-zinc-500 text-sm"><Trash2 size={16}/> {t('shoppingList.confirm.clearAction')}</button>
                </div>
            </div>
        </div>
    );
};