import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, CheckCircle, Trash2, Shield, ExternalLink } from 'lucide-react';
import { saveApiKey, deleteApiKey, hasApiKey } from '../../../services/apiKeyService';
import { invalidateAIClient } from '../../../services/geminiService';

interface ApiKeyPanelProps {
    addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const ApiKeyPanel: React.FC<ApiKeyPanelProps> = ({ addToast }) => {
    const [keyInput, setKeyInput] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [hasKey, setHasKey] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        hasApiKey().then(result => {
            setHasKey(result);
            setIsLoading(false);
        });
    }, []);

    const handleSave = async () => {
        if (!keyInput.trim()) {
            addToast('Bitte gib einen API-Schlüssel ein.', 'error');
            return;
        }
        if (!keyInput.startsWith('AIza')) {
            addToast('Das sieht nicht nach einem gültigen Google API-Schlüssel aus.', 'error');
            return;
        }
        try {
            await saveApiKey(keyInput.trim());
            invalidateAIClient();
            setHasKey(true);
            setKeyInput('');
            addToast('API-Schlüssel sicher gespeichert.', 'success');
        } catch {
            addToast('Fehler beim Speichern des Schlüssels.', 'error');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('API-Schlüssel wirklich entfernen? KI-Funktionen werden deaktiviert.')) return;
        try {
            await deleteApiKey();
            invalidateAIClient();
            setHasKey(false);
            setKeyInput('');
            addToast('API-Schlüssel entfernt.', 'info');
        } catch {
            addToast('Fehler beim Entfernen des Schlüssels.', 'error');
        }
    };

    if (isLoading) {
        return <div className="animate-pulse h-40 bg-zinc-800/50 rounded-2xl" />;
    }

    return (
        <div className="space-y-6 page-fade-in">
            {/* Security Notice */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                    <Shield className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
                    <div className="space-y-2">
                        <h4 className="font-bold text-amber-400 text-sm">Sicherheitshinweis</h4>
                        <p className="text-zinc-400 text-xs leading-relaxed">
                            Dein API-Schlüssel wird <strong className="text-zinc-300">ausschließlich lokal</strong> auf deinem Gerät 
                            in einer geschützten IndexedDB gespeichert. Er wird niemals an unsere Server gesendet – 
                            nur direkt an die Google Gemini API.
                        </p>
                    </div>
                </div>
            </div>

            {/* Current Status & Input */}
            <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-zinc-100 mb-4 flex items-center gap-2">
                    <Key className="text-[var(--color-accent-400)]" /> Gemini API-Schlüssel
                </h3>

                <div className="flex items-center gap-3 mb-6">
                    <div className={`w-3 h-3 rounded-full ${hasKey ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className={`text-sm font-medium ${hasKey ? 'text-emerald-400' : 'text-red-400'}`}>
                        {hasKey ? 'API-Schlüssel konfiguriert – KI-Funktionen aktiv' : 'Kein API-Schlüssel – KI-Funktionen deaktiviert'}
                    </span>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <input
                            type={showKey ? 'text' : 'password'}
                            value={keyInput}
                            onChange={e => setKeyInput(e.target.value)}
                            placeholder={hasKey ? 'Neuen Schlüssel eingeben zum Ersetzen...' : 'AIza... API-Schlüssel hier einfügen'}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 pr-12 text-zinc-200 placeholder-zinc-500 focus:ring-2 focus:ring-[var(--color-accent-500)] focus:border-transparent outline-none font-mono text-sm"
                            onKeyDown={e => e.key === 'Enter' && handleSave()}
                            aria-label="Gemini API-Schlüssel"
                        />
                        <button
                            type="button"
                            onClick={() => setShowKey(!showKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                            aria-label={showKey ? 'Schlüssel verbergen' : 'Schlüssel anzeigen'}
                        >
                            {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleSave}
                            disabled={!keyInput.trim()}
                            className="flex items-center gap-2 bg-[var(--color-accent-500)] text-zinc-900 font-bold py-2.5 px-5 rounded-xl hover:bg-[var(--color-accent-400)] transition-all disabled:bg-zinc-800 disabled:text-zinc-600 active:scale-95"
                        >
                            <CheckCircle size={16} /> Speichern
                        </button>
                        {hasKey && (
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-2 bg-red-500/10 text-red-400 font-bold py-2.5 px-5 rounded-xl hover:bg-red-500/20 border border-red-500/30 transition-all active:scale-95"
                            >
                                <Trash2 size={16} /> Entfernen
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* How to get a key */}
            <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
                <h4 className="font-bold text-zinc-300 mb-3 text-sm">So bekommst du einen API-Schlüssel:</h4>
                <ol className="space-y-2 text-zinc-400 text-sm list-decimal list-inside">
                    <li>Öffne <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-400)] underline hover:text-[var(--color-accent-300)] inline-flex items-center gap-1">Google AI Studio <ExternalLink size={12} /></a></li>
                    <li>Melde dich mit deinem Google-Konto an</li>
                    <li>Klicke auf &quot;Create API Key&quot;</li>
                    <li>Kopiere den Schlüssel und füge ihn oben ein</li>
                </ol>
            </section>
        </div>
    );
};
