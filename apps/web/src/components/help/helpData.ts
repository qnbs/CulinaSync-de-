
import { ShoppingCart, TerminalSquare, Mic, ShieldCheck, WifiOff, Zap } from 'lucide-react';

export const FAQS = [
    {
        id: 'local-first',
        categoryKey: 'help.faq.categories.general',
        questionKey: 'help.faq.localFirst.question',
        answerKey: 'help.faq.localFirst.answer'
    },
    {
        id: 'ai-privacy',
        categoryKey: 'help.faq.categories.privacy',
        questionKey: 'help.faq.aiPrivacy.question',
        answerKey: 'help.faq.aiPrivacy.answer'
    },
    {
        id: 'pantry-color',
        categoryKey: 'help.faq.categories.features',
        questionKey: 'help.faq.pantryColor.question',
        answerKey: 'help.faq.pantryColor.answer'
    },
    {
        id: 'sync-devices',
        categoryKey: 'help.faq.categories.general',
        questionKey: 'help.faq.syncDevices.question',
        answerKey: 'help.faq.syncDevices.answer'
    }
];

export const PRO_TIPS = [
    {
        id: 'cmd-palette',
        icon: TerminalSquare,
        titleKey: 'help.tips.cmdPalette.title',
        descriptionKey: 'help.tips.cmdPalette.description',
        actionLabelKey: 'help.tips.cmdPalette.actionLabel',
        actionId: 'OPEN_CMD'
    },
    {
        id: 'voice-control',
        icon: Mic,
        titleKey: 'help.tips.voiceControl.title',
        descriptionKey: 'help.tips.voiceControl.description',
        actionLabelKey: 'help.tips.voiceControl.actionLabel',
        actionId: 'TOGGLE_VOICE'
    },
    {
        id: 'shopping-generate',
        icon: ShoppingCart,
        titleKey: 'help.tips.shoppingGenerate.title',
        descriptionKey: 'help.tips.shoppingGenerate.description',
        actionLabelKey: 'help.tips.shoppingGenerate.actionLabel',
        actionId: 'NAV_SHOPPING'
    }
];

export const TECH_STACK = [
    { id: 'react', name: 'React 19', icon: '⚛️', descKey: 'help.tech.react' },
    { id: 'gemini', name: 'Google Gemini', icon: '🧠', descKey: 'help.tech.gemini' },
    { id: 'dexie', name: 'Dexie.js', icon: '🗄️', descKey: 'help.tech.dexie' },
    { id: 'redux', name: 'Redux Toolkit', icon: '🔄', descKey: 'help.tech.redux' },
    { id: 'tailwind', name: 'Tailwind CSS', icon: '🎨', descKey: 'help.tech.tailwind' },
    { id: 'vite', name: 'Vite PWA', icon: '📱', descKey: 'help.tech.vite' }
];

export const PHILOSOPHY = [
    { id: 'offlineFirst', icon: WifiOff, titleKey: 'help.philosophy.offlineFirst.title', descKey: 'help.philosophy.offlineFirst.description' },
    { id: 'privacy', icon: ShieldCheck, titleKey: 'help.philosophy.privacy.title', descKey: 'help.philosophy.privacy.description' },
    { id: 'performance', icon: Zap, titleKey: 'help.philosophy.performance.title', descKey: 'help.philosophy.performance.description' }
];