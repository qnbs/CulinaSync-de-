import React, { useEffect, useOptimistic, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Key, Eye, EyeOff, CheckCircle, Trash2, Shield, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useModalA11y } from '../../../hooks/useModalA11y';
import { hasApiKey } from '../../../services/apiKeyService';
import { createApiKeyFormSchema, type ApiKeyFormValues } from '../../../features/settings/api-key/apiKeySchema';
import { storeUserApiKey } from '../../../features/settings/api-key/commands/storeUserApiKey';
import { removeUserApiKey } from '../../../features/settings/api-key/commands/removeUserApiKey';

interface ApiKeyPanelProps {
    addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const RemoveApiKeyConfirmationModal: React.FC<{
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
}> = ({ onClose, onConfirm, isDeleting }) => {
    const { t } = useTranslation();
    const modalRef = useRef<HTMLDivElement>(null);
    const cancelButtonRef = useRef<HTMLButtonElement>(null);

    useModalA11y({
        isOpen: true,
        onClose,
        containerRef: modalRef,
        initialFocusRef: cancelButtonRef,
    });

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 page-fade-in glass-overlay" onClick={onClose}>
            <div
                ref={modalRef}
                className="rounded-2xl p-6 w-full max-w-md glass-modal"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="remove-api-key-title"
                aria-describedby="remove-api-key-description"
                tabIndex={-1}
            >
                <div className="flex items-center gap-3 text-red-500 mb-4">
                    <div className="p-2 bg-red-500/10 rounded-full"><Trash2 size={24} /></div>
                    <h4 id="remove-api-key-title" className="text-lg font-bold text-zinc-100">{t('settings.apiKey.confirm.title')}</h4>
                </div>
                <p id="remove-api-key-description" className="text-zinc-400 text-sm mb-6">
                    {t('settings.apiKey.confirm.description')}
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        ref={cancelButtonRef}
                        type="button"
                        onClick={onClose}
                        className="py-2.5 px-4 rounded-xl text-zinc-400 hover:bg-zinc-800 font-medium"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="py-2.5 px-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                    >
                        <Trash2 size={16} /> {isDeleting ? t('settings.apiKey.deleting') : t('settings.apiKey.confirm.action')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ApiKeyPanel: React.FC<ApiKeyPanelProps> = ({ addToast }) => {
    const { t } = useTranslation();
    const [showKey, setShowKey] = useState(false);
    const [hasKey, setHasKey] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [optimisticHasKey, setOptimisticHasKey] = useOptimistic<boolean, boolean>(hasKey, (_current: boolean, nextValue: boolean) => nextValue);
    const form = useForm<ApiKeyFormValues>({
        resolver: zodResolver(createApiKeyFormSchema()),
        defaultValues: { apiKey: '' },
    });

    useEffect(() => {
        hasApiKey().then(result => {
            setHasKey(result);
            setIsLoading(false);
        });
    }, []);

    const handleSave = form.handleSubmit(async (values) => {
        const previousHasKey = hasKey;
        setOptimisticHasKey(true);
        setIsSaving(true);
        try {
            await storeUserApiKey(values.apiKey);
            setHasKey(true);
            form.reset();
            addToast(t('settings.apiKey.toast.saved'), 'success');
        } catch {
            setOptimisticHasKey(previousHasKey);
            addToast(t('settings.apiKey.toast.saveError'), 'error');
        } finally {
            setIsSaving(false);
        }
    });

    const handleDelete = async () => {
        setIsConfirmModalOpen(false);
        const previousHasKey = hasKey;
        setOptimisticHasKey(false);
        setIsDeleting(true);
        try {
            await removeUserApiKey();
            setHasKey(false);
            form.reset();
            addToast(t('settings.apiKey.toast.removed'), 'info');
        } catch {
            setOptimisticHasKey(previousHasKey);
            addToast(t('settings.apiKey.toast.removeError'), 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return <div className="animate-pulse h-40 bg-zinc-800/50 rounded-2xl" />;
    }

    return (
        <div className="space-y-6 page-fade-in">
            {/* Security Notice */}
            <div className="glass-card bg-amber-500/10 border-amber-500/30 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                    <Shield className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
                    <div className="space-y-2">
                        <h4 className="font-bold text-amber-400 text-sm">{t('settings.apiKey.securityTitle')}</h4>
                        <p className="text-zinc-400 text-xs leading-relaxed">{t('settings.apiKey.securityNotice')}</p>
                    </div>
                </div>
            </div>

            {/* Current Status & Input */}
            <section className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-bold text-zinc-100 mb-4 flex items-center gap-2">
                    <Key className="text-[var(--color-accent-400)]" /> {t('settings.apiKey.title')}
                </h3>

                <div className="flex items-center gap-3 mb-6">
                    <div className={`w-3 h-3 rounded-full ${optimisticHasKey ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className={`text-sm font-medium ${optimisticHasKey ? 'text-emerald-400' : 'text-red-400'}`}>
                        {optimisticHasKey ? t('settings.apiKey.status.configured') : t('settings.apiKey.status.missing')}
                    </span>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <input
                            {...form.register('apiKey')}
                            type={showKey ? 'text' : 'password'}
                            placeholder={optimisticHasKey ? t('settings.apiKey.replacePlaceholder') : t('settings.apiKey.placeholder')}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 pr-12 text-zinc-200 placeholder-zinc-500 focus:ring-2 focus:ring-[var(--color-accent-500)] focus:border-transparent outline-none font-mono text-sm"
                            aria-label={t('settings.apiKey.ariaLabel')}
                        />
                        <button
                            type="button"
                            onClick={() => setShowKey(!showKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                            aria-label={showKey ? t('settings.apiKey.hideKeyAria') : t('settings.apiKey.showKeyAria')}
                        >
                            {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {form.formState.errors.apiKey && (
                        <p className="text-sm text-red-400">{form.formState.errors.apiKey.message}</p>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={handleSave}
                            disabled={isSaving || isDeleting}
                            className="flex items-center gap-2 bg-[var(--color-accent-500)] text-zinc-900 font-bold py-2.5 px-5 rounded-xl hover:bg-[var(--color-accent-400)] transition-all disabled:bg-zinc-800 disabled:text-zinc-600 active:scale-95"
                        >
                            <CheckCircle size={16} /> {isSaving ? t('settings.apiKey.saving') : t('common.save')}
                        </button>
                        {optimisticHasKey && (
                            <button
                                type="button"
                                onClick={() => setIsConfirmModalOpen(true)}
                                disabled={isSaving || isDeleting}
                                className="flex items-center gap-2 bg-red-500/10 text-red-400 font-bold py-2.5 px-5 rounded-xl hover:bg-red-500/20 border border-red-500/30 transition-all active:scale-95"
                            >
                                <Trash2 size={16} /> {isDeleting ? t('settings.apiKey.deleting') : t('settings.apiKey.confirm.action')}
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {isConfirmModalOpen && (
                <RemoveApiKeyConfirmationModal
                    onClose={() => setIsConfirmModalOpen(false)}
                    onConfirm={handleDelete}
                    isDeleting={isDeleting}
                />
            )}

            {/* How to get a key */}
            <section className="glass-card rounded-2xl p-6">
                <h4 className="font-bold text-zinc-300 mb-3 text-sm">{t('settings.apiKey.howToTitle')}</h4>
                <ol className="space-y-2 text-zinc-400 text-sm list-decimal list-inside">
                    <li>{t('settings.apiKey.steps.open')} <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-400)] underline hover:text-[var(--color-accent-300)] inline-flex items-center gap-1">Google AI Studio <ExternalLink size={12} /></a></li>
                    <li>{t('settings.apiKey.steps.signIn')}</li>
                    <li>{t('settings.apiKey.steps.create')}</li>
                    <li>{t('settings.apiKey.steps.copy')}</li>
                    <li>{t('settings.apiKey.steps.recommendation')}</li>
                </ol>
            </section>
        </div>
    );
};
