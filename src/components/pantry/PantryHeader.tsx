import React, { useMemo } from 'react';
import { PlusCircle, Package, AlertTriangle, ShoppingCart } from 'lucide-react';
import { usePantryManagerContext } from '../../contexts/PantryManagerContext';
import { getExpiryStatus } from '../PantryListItem';
import { useAppSelector } from '../../store/hooks';

const StatCard = ({ icon: Icon, label, value, colorClass, bgClass }: { icon: any, label: string, value: number, colorClass: string, bgClass: string }) => (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-white/5 shadow-lg backdrop-blur-sm ${bgClass}`}>
        <div className={`p-2 rounded-full bg-black/20 ${colorClass}`}>
            <Icon size={20} />
        </div>
        <div>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</p>
            <p className="text-xl font-bold text-zinc-100 tabular-nums">{value}</p>
        </div>
    </div>
);

export const PantryHeader = () => {
    const { setModalState, pantryItems } = usePantryManagerContext();
    const { pantry: pantrySettings } = useAppSelector(state => state.settings);

    const stats = useMemo(() => {
        if (!pantryItems) return { total: 0, expiring: 0, low: 0 };
        return pantryItems.reduce((acc, item) => {
            acc.total++;
            
            const status = getExpiryStatus(item.expiryDate, pantrySettings.expiryWarningDays);
            if (status === 'expired' || status === 'nearing') {
                acc.expiring++;
            }

            if (item.minQuantity !== undefined && item.quantity <= item.minQuantity) {
                acc.low++;
            }
            return acc;
        }, { total: 0, expiring: 0, low: 0 });
    }, [pantryItems, pantrySettings.expiryWarningDays]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-100 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                        Meine Vorratskammer
                    </h2>
                    <p className="text-zinc-400 mt-1">
                        Dein intelligentes Inventar.
                    </p>
                </div>
                <button 
                    onClick={() => setModalState({ isOpen: true, item: null })} 
                    className="group flex items-center justify-center gap-2 bg-gradient-to-br from-[var(--color-accent-500)] to-[var(--color-accent-600)] text-zinc-900 font-bold py-2.5 px-5 rounded-xl hover:shadow-[0_0_20px_var(--color-accent-glow)] transition-all duration-300 active:scale-95"
                >
                    <PlusCircle size={18} className="group-hover:rotate-90 transition-transform duration-300"/> 
                    <span>Artikel hinzufügen</span>
                </button>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard 
                    icon={Package} 
                    label="Gesamtbestand" 
                    value={stats.total} 
                    colorClass="text-blue-400" 
                    bgClass="bg-zinc-900/40"
                />
                <StatCard 
                    icon={AlertTriangle} 
                    label="Kritisch / Ablauf" 
                    value={stats.expiring} 
                    colorClass="text-red-400" 
                    bgClass="bg-red-900/10 border-red-500/20"
                />
                <StatCard 
                    icon={ShoppingCart} 
                    label="Nachkaufen" 
                    value={stats.low} 
                    colorClass="text-amber-400" 
                    bgClass="bg-amber-900/10 border-amber-500/20"
                />
            </div>
        </div>
    );
};