import React, { useState, useRef } from 'react';
import { Plus, Wand2, Camera, Barcode } from 'lucide-react';
import { usePantryManagerContext } from '../../contexts/PantryManagerContext';
import Tesseract from 'tesseract.js';

export const PantryQuickAdd = () => {
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

    // --- OCR (Foto/Textbild) ---
    const handleImageInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setVisionLoading(true);
        try {
            const { data } = await Tesseract.recognize(file, 'deu');
            if (data.text) setInput(data.text.trim());
        } catch (err) {
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
                        placeholder="Smart Add: z.B. '500g Spaghetti'" 
                        className="flex-grow bg-transparent focus:outline-none p-1 text-zinc-100 placeholder-zinc-500 text-base"
                    />
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageInput}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-shrink-0 flex items-center justify-center bg-zinc-800 text-[var(--color-accent-400)] h-10 w-10 rounded-xl hover:bg-zinc-700 transition-colors shadow-lg active:scale-95 mr-1"
                        aria-label="Foto/Textbild erkennen"
                        disabled={visionLoading}
                    >
                        <Camera size={20}/>
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
                        aria-label="Hinzufügen"
                    >
                        {visionLoading ? <span className="animate-spin">⏳</span> : <Plus size={20}/>} 
                    </button>
                </form>
            </div>
        </div>
    );
};