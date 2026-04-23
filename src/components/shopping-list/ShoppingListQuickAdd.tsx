import { useShoppingListContext } from '../../contexts/ShoppingListContext';
import { Plus, Send, Archive, Mic, Camera, LoaderCircle } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { lookupBarcodeItemName, parseReceiptTextToShoppingItems } from '../../services/smartInputService';
import { getAppServices } from '../../services/serviceRegistry';

interface SpeechRecognitionAlternative {
    transcript: string;
}

interface SpeechRecognitionResult {
    isFinal: boolean;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionEvent {
    resultIndex: number;
    results: {
        [index: number]: SpeechRecognitionResult;
        length: number;
    };
}

interface BrowserSpeechRecognition {
    lang: string;
    interimResults: boolean;
    continuous: boolean;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onend: (() => void) | null;
    onerror: (() => void) | null;
    start: () => void;
    stop: () => void;
}

const getSpeechRecognitionCtor = (): { new (): BrowserSpeechRecognition } | null => {
    const browserWindow = window as unknown as { SpeechRecognition?: { new (): BrowserSpeechRecognition }; webkitSpeechRecognition?: { new (): BrowserSpeechRecognition } };
    return browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition || null;
};

export const ShoppingListQuickAdd = () => {
    const { t } = useTranslation();
    const {
        completedItems,
        handleMoveToPantry,
        quickAddItem,
        setQuickAddItem,
        handleQuickAdd,
        handleBulkAdd,
        addItemInputRef,
        isShoppingMode
    } = useShoppingListContext();

    const [isListening, setIsListening] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [scanModeOpen, setScanModeOpen] = useState(false);
    const barcodeInputRef = useRef<HTMLInputElement>(null);
    const receiptInputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);

    const startVoiceInput = () => {
        const SpeechRecognitionCtor = getSpeechRecognitionCtor();
        if (!SpeechRecognitionCtor || isListening) return;

        const recognition = new SpeechRecognitionCtor();
        recognition.lang = 'de-DE';
        recognition.interimResults = true;
        recognition.continuous = false;

        recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i += 1) {
                transcript += event.results[i][0].transcript;
            }
            setQuickAddItem(transcript.trim());
        };

        recognition.onend = () => {
            setIsListening(false);
            recognitionRef.current = null;
            addItemInputRef.current?.focus();
        };

        recognition.onerror = () => {
            setIsListening(false);
            recognitionRef.current = null;
        };

        recognitionRef.current = recognition;
        setIsListening(true);
        recognition.start();
    };

    const stopVoiceInput = () => {
        recognitionRef.current?.stop();
        setIsListening(false);
    };

    const handleBarcodeImage = async (file?: File) => {
        if (!file) return;
        setIsScanning(true);
        try {
            const code = await getAppServices().scanner.scanBarcodeFromImage(file);
            if (!code) return;

            const itemName = lookupBarcodeItemName(code) || code;
            setQuickAddItem((prev: string) => (prev ? `${prev}, ${itemName}` : itemName));
            addItemInputRef.current?.focus();
        } catch {
            // Keep silent here to avoid noisy UX; user can retry with another image.
        } finally {
            setIsScanning(false);
            setScanModeOpen(false);
        }
    };

    const handleReceiptImage = async (file?: File) => {
        if (!file) return;
        setIsScanning(true);
        try {
            const text = await getAppServices().scanner.recognizeTextFromImage(file, 'deu+eng');
            const parsedItems = parseReceiptTextToShoppingItems(text);
            if (parsedItems.length > 0) {
                await handleBulkAdd(parsedItems.map((item) => ({ ...item, recipeId: undefined })));
            }
        } catch {
            // Ignore and let user retry.
        } finally {
            setIsScanning(false);
            setScanModeOpen(false);
        }
    };

    // In shopping mode, we hide the quick add bar to minimize distraction, 
    // unless there are completed items to move to pantry.
    if (isShoppingMode && completedItems.length === 0) return null;

    return (
        // Adjusted bottom position for mobile to sit above BottomNav + safe area
        <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:bottom-6 left-0 right-0 z-40 px-4 pointer-events-none transition-all duration-300">
            <div className="max-w-3xl mx-auto pointer-events-auto">
                {completedItems.length > 0 ? (
                    <button 
                        onClick={handleMoveToPantry} 
                        className="w-full flex items-center justify-center gap-3 bg-zinc-900/95 backdrop-blur-xl border border-[var(--color-accent-500)]/30 text-zinc-200 font-bold py-3.5 px-4 rounded-2xl hover:bg-[var(--color-accent-500)] hover:text-zinc-900 transition-all shadow-2xl group mb-3 active:scale-[0.98]"
                    >
                        <Archive size={20} className="group-hover:scale-110 transition-transform"/>
                        <span>{t('shoppingList.quickAdd.doneMoveToPantry', { count: completedItems.length })}</span>
                    </button>
                ) : null}

                {!isShoppingMode && (
                    <form onSubmit={handleQuickAdd} className="flex items-center gap-2 bg-zinc-900/90 backdrop-blur-xl rounded-2xl p-2 border border-white/10 shadow-2xl focus-within:ring-2 focus-within:ring-[var(--color-accent-500)] focus-within:border-[var(--color-accent-500)] transition-all">
                         <div className="p-2 text-zinc-500">
                            <Plus size={20}/>
                         </div>
                         <input
                            ref={addItemInputRef} 
                            type="text" 
                            value={quickAddItem} 
                            onChange={e => setQuickAddItem(e.target.value)} 
                            placeholder={t('shoppingList.quickAdd.placeholder')}
                            className="flex-grow bg-transparent focus:outline-none p-1 text-zinc-100 placeholder-zinc-500 text-base"
                        />
                        <button
                            type="button"
                            onClick={isListening ? stopVoiceInput : startVoiceInput}
                            className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-xl transition-colors ${isListening ? 'bg-red-500 text-zinc-950' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
                            aria-label={t('shoppingList.quickAdd.voiceAria')}
                        >
                            <Mic size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setScanModeOpen((prev: boolean) => !prev)}
                            className="flex-shrink-0 flex items-center justify-center bg-zinc-800 text-zinc-300 h-10 w-10 rounded-xl hover:bg-zinc-700 transition-colors"
                            aria-label={t('shoppingList.quickAdd.cameraAria')}
                        >
                            {isScanning ? <LoaderCircle size={18} className="animate-spin" /> : <Camera size={18} />}
                        </button>
                         <button 
                            type="submit" 
                            disabled={!quickAddItem.trim()}
                            className="flex-shrink-0 flex items-center justify-center bg-[var(--color-accent-500)] text-zinc-900 font-bold h-10 w-10 rounded-xl hover:bg-[var(--color-accent-400)] disabled:bg-zinc-800 disabled:text-zinc-600 transition-colors shadow-lg" 
                            aria-label={t('shoppingList.quickAdd.submitAria')}
                        >
                             <Send size={18}/>
                         </button>
                    </form>
                )}

                {scanModeOpen && !isShoppingMode && (
                    <div className="mt-2 bg-zinc-900/95 border border-zinc-700 rounded-2xl p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => barcodeInputRef.current?.click()}
                            disabled={isScanning}
                            className="py-2 px-3 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors text-sm font-medium"
                        >
                            {t('shoppingList.quickAdd.scanBarcode')}
                        </button>
                        <button
                            type="button"
                            onClick={() => receiptInputRef.current?.click()}
                            disabled={isScanning}
                            className="py-2 px-3 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors text-sm font-medium"
                        >
                            {t('shoppingList.quickAdd.scanReceipt')}
                        </button>
                        <input
                            ref={barcodeInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                void handleBarcodeImage(file);
                                e.target.value = '';
                            }}
                        />
                        <input
                            ref={receiptInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                void handleReceiptImage(file);
                                e.target.value = '';
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};