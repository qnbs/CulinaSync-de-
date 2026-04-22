import React, { useState, useRef } from 'react';
import { Plus, Wand2, Camera } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePantryManagerContext } from '../../contexts/PantryManagerContext';
import { getAppServices } from '../../services/serviceRegistry';

export const PantryQuickAdd = () => {
    const { t } = useTranslation();
    const { handleQuickAdd } = usePantryManagerContext();
    const [input, setInput] = useState('');
    const [visionLoading, setVisionLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        handleQuickAdd(input);
        setInput('');
    };

    // --- Multi-Modal: Gemini Vision (mit Fallback OCR) ---
    const handleImageInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setVisionLoading(true);
        try {
            let visionText = '';
            try {
                visionText = await getAppServices().ai.extractPantryItemsFromImage(file);
            } catch {
                // Fallback: OCR lokal
                visionText = await getAppServices().scanner.recognizeTextFromImage(file, 'deu');
            }
            if (visionText) setInput(visionText);
        } catch {
            alert('Bild konnte nicht erkannt werden.');
        } finally {
            setVisionLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:bottom-6 left-0 right-0 z-40 px-4 pointer-events-none transition-all duration-300">
            <div className="max-w-3xl mx-auto pointer-events-auto">
                <form 
                    onSubmit={handleSubmit} 
                    className="flex items-center gap-2 bg-zinc-900/90 backdrop-blur-xl rounded-2xl p-2 border border-white/10 shadow-2xl focus-within:ring-2 focus-within:ring-[var(--color-accent-500)] focus-within:border-[var(--color-accent-500)] transition-all"
                >
                    <div className="p-2 text-[var(--color-accent-500)]">
                        <Wand2 size={20}/>
                    </div>
                    <input 
                        type="text" 
                        value={input} 
                        onChange={e => setInput(e.target.value)} 
                        placeholder={t('pantry.quickAdd.placeholder')} 
                        aria-label={t('pantry.quickAdd.inputAria')}
                        className="flex-grow bg-transparent focus:outline-none p-1 text-zinc-100 placeholder-zinc-500 text-base"
                    />
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        ref={fileInputRef}
                        onChange={handleImageInput}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-shrink-0 flex items-center justify-center bg-zinc-800 text-[var(--color-accent-400)] h-10 w-10 rounded-xl hover:bg-zinc-700 transition-colors shadow-lg active:scale-95 mr-1"
                        aria-label={t('pantry.quickAdd.imageAria')}
                        disabled={visionLoading}
                    >
                        {visionLoading ? <span className="animate-spin">⏳</span> : <Camera size={20}/>} 
                    </button>
                    {/* Barcode-Scan-Button (Platzhalter, Implementierung folgt) */}
                    {/*
                    <button
                        type="button"
                        onClick={handleBarcodeScan}
                        className="flex-shrink-0 flex items-center justify-center bg-zinc-800 text-[var(--color-accent-400)] h-10 w-10 rounded-xl hover:bg-zinc-700 transition-colors shadow-lg active:scale-95 mr-1"
                        aria-label="Barcode scannen"
                        disabled={visionLoading}
                    >
                        <Barcode size={20}/>
                    </button>
                    */}
                    <button 
                        type="submit" 
                        disabled={!input.trim() || visionLoading}
                        className="flex-shrink-0 flex items-center justify-center bg-[var(--color-accent-500)] text-zinc-900 font-bold h-10 w-10 rounded-xl hover:bg-[var(--color-accent-400)] disabled:bg-zinc-800 disabled:text-zinc-600 transition-colors shadow-lg active:scale-95" 
                        aria-label={t('pantry.quickAdd.submitAria')}
                    >
                        {visionLoading ? <span className="animate-spin">⏳</span> : <Plus size={20}/>} 
                    </button>
                </form>
            </div>
        </div>
    );
};