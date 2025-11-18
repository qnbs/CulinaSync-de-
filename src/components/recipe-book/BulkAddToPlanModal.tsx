import React, { useState } from 'react';
import { db } from '../../services/db';
import { LoaderCircle, CalendarPlus, X } from 'lucide-react';

interface BulkAddToPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipeIds: number[];
    onSave: (count: number) => void;
}

export const BulkAddToPlanModal: React.FC<BulkAddToPlanModalProps> = ({ isOpen, onClose, recipeIds, onSave }) => {
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [mealType, setMealType] = useState<'Frühstück' | 'Mittagessen' | 'Abendessen'>('Abendessen');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        const date = new Date(startDate);
        // Adjust for timezone offset to ensure correct date calculation
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset());

        for (const recipeId of recipeIds) {
            const dateString = date.toISOString().split('T')[0];
            await db.mealPlan.add({ recipeId, date: dateString, mealType, isCooked: false });
            date.setDate(date.getDate() + 1); // Increment day for the next recipe
        }
        setIsSaving(false);
        onSave(recipeIds.length);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center z-50 page-fade-in" onClick={onClose}>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors">
                    <X size={20} />
                </button>
                
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-full bg-[var(--color-accent-500)]/10 text-[var(--color-accent-400)]">
                        <CalendarPlus size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-zinc-100">Zum Plan hinzufügen</h3>
                        <p className="text-xs text-zinc-400">{recipeIds.length} Rezepte ausgewählt</p>
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="space-y-1.5">
                        <label htmlFor="startDate" className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Startdatum</label>
                        <input 
                            type="date" 
                            id="startDate" 
                            value={startDate} 
                            onChange={e => setStartDate(e.target.value)} 
                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl p-3 text-zinc-200 focus:ring-2 focus:ring-[var(--color-accent-500)] focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="mealType" className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Mahlzeit</label>
                        <div className="relative">
                            <select 
                                id="mealType" 
                                value={mealType} 
                                onChange={e => setMealType(e.target.value as any)} 
                                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl p-3 text-zinc-200 focus:ring-2 focus:ring-[var(--color-accent-500)] focus:border-transparent outline-none appearance-none transition-all"
                            >
                                <option>Frühstück</option>
                                <option>Mittagessen</option>
                                <option>Abendessen</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-zinc-800/50 rounded-lg p-3 text-xs text-zinc-400 border border-zinc-800">
                        Die Rezepte werden ab dem <span className="text-zinc-200 font-medium">{new Date(startDate).toLocaleDateString('de-DE')}</span> als aufeinanderfolgende <span className="text-zinc-200 font-medium">{mealType}</span> geplant.
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button onClick={onClose} className="flex-1 py-2.5 px-4 rounded-xl text-zinc-400 font-medium hover:bg-zinc-800 hover:text-zinc-200 transition-colors">
                        Abbrechen
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving} 
                        className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--color-accent-500)] text-zinc-900 font-bold hover:bg-[var(--color-accent-400)] hover:shadow-[0_0_15px_var(--color-accent-glow)] transition-all disabled:bg-zinc-700 disabled:text-zinc-500 disabled:shadow-none flex items-center justify-center gap-2"
                    >
                        {isSaving ? <LoaderCircle size={18} className="animate-spin" /> : 'Planen'}
                    </button>
                </div>
            </div>
        </div>
    );
};