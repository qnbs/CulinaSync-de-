import type { LucideIcon } from 'lucide-react';
import {
  ShoppingCart,
  TerminalSquare,
  Mic,
  ShieldCheck,
  WifiOff,
  Zap,
  Key,
  Cloud,
  QrCode,
  ChefHat,
  Smartphone,
  Lock,
  Sparkles,
  Database,
  Settings,
  CalendarDays,
  Heart,
} from 'lucide-react';

export type HelpSettingsFocus =
  | 'appearance'
  | 'modules'
  | 'workspace'
  | 'ai'
  | 'localAi'
  | 'policies'
  | 'privacy'
  | 'speech'
  | 'apikey'
  | 'health'
  | 'community'
  | 'data'
  | 'export'
  | 'import';

export type HelpActionId =
  | 'OPEN_CMD'
  | 'NAV_SHOPPING'
  | 'NAV_SETTINGS_SPEECH'
  | 'NAV_SETTINGS_APIKEY'
  | 'NAV_SETTINGS_DATA'
  | 'NAV_SETTINGS_PRIVACY'
  | 'NAV_SETTINGS_LOCAL_AI'
  | 'NAV_SETTINGS_POLICIES'
  | 'NAV_AI_CHEF'
  | 'NAV_MEAL_PLANNER'
  | 'NAV_SETTINGS'
  | 'NAV_PANTRY';

export interface FaqEntry {
  id: string;
  categoryKey: string;
  questionKey: string;
  answerKey: string;
  keywordKeys?: string[];
  settingsFocus?: HelpSettingsFocus;
}

export interface ProTipEntry {
  id: string;
  icon: LucideIcon;
  titleKey: string;
  descriptionKey: string;
  actionLabelKey: string;
  actionId: HelpActionId;
}

export interface QuickLinkEntry {
  id: string;
  icon: LucideIcon;
  labelKey: string;
  descriptionKey: string;
  settingsFocus: HelpSettingsFocus;
}

export const FAQS: FaqEntry[] = [
  {
    id: 'local-first',
    categoryKey: 'help.faq.categories.general',
    questionKey: 'help.faq.localFirst.question',
    answerKey: 'help.faq.localFirst.answer',
    keywordKeys: ['help.faq.keywords.offline', 'help.faq.keywords.indexeddb'],
  },
  {
    id: 'ai-privacy',
    categoryKey: 'help.faq.categories.privacy',
    questionKey: 'help.faq.aiPrivacy.question',
    answerKey: 'help.faq.aiPrivacy.answer',
    keywordKeys: ['help.faq.keywords.gemini', 'help.faq.keywords.localAi'],
    settingsFocus: 'privacy',
  },
  {
    id: 'api-key',
    categoryKey: 'help.faq.categories.ai',
    questionKey: 'help.faq.apiKey.question',
    answerKey: 'help.faq.apiKey.answer',
    settingsFocus: 'apikey',
  },
  {
    id: 'local-ai',
    categoryKey: 'help.faq.categories.ai',
    questionKey: 'help.faq.localAi.question',
    answerKey: 'help.faq.localAi.answer',
    settingsFocus: 'localAi',
  },
  {
    id: 'sync-devices',
    categoryKey: 'help.faq.categories.data',
    questionKey: 'help.faq.syncDevices.question',
    answerKey: 'help.faq.syncDevices.answer',
    keywordKeys: ['help.faq.keywords.qr', 'help.faq.keywords.cloud'],
    settingsFocus: 'data',
  },
  {
    id: 'vault-backup',
    categoryKey: 'help.faq.categories.data',
    questionKey: 'help.faq.vault.question',
    answerKey: 'help.faq.vault.answer',
    settingsFocus: 'data',
  },
  {
    id: 'cloud-sync',
    categoryKey: 'help.faq.categories.data',
    questionKey: 'help.faq.cloudSync.question',
    answerKey: 'help.faq.cloudSync.answer',
    settingsFocus: 'data',
  },
  {
    id: 'policies',
    categoryKey: 'help.faq.categories.features',
    questionKey: 'help.faq.policies.question',
    answerKey: 'help.faq.policies.answer',
    settingsFocus: 'policies',
  },
  {
    id: 'pantry-color',
    categoryKey: 'help.faq.categories.features',
    questionKey: 'help.faq.pantryColor.question',
    answerKey: 'help.faq.pantryColor.answer',
    settingsFocus: 'workspace',
  },
  {
    id: 'pwa-install',
    categoryKey: 'help.faq.categories.pwa',
    questionKey: 'help.faq.pwaInstall.question',
    answerKey: 'help.faq.pwaInstall.answer',
    settingsFocus: 'data',
  },
  {
    id: 'backup-formats',
    categoryKey: 'help.faq.categories.data',
    questionKey: 'help.faq.backupFormats.question',
    answerKey: 'help.faq.backupFormats.answer',
    settingsFocus: 'export',
  },
  {
    id: 'cook-voice',
    categoryKey: 'help.faq.categories.features',
    questionKey: 'help.faq.cookVoice.question',
    answerKey: 'help.faq.cookVoice.answer',
    settingsFocus: 'speech',
  },
];

export const PRO_TIPS: ProTipEntry[] = [
  {
    id: 'cmd-palette',
    icon: TerminalSquare,
    titleKey: 'help.tips.cmdPalette.title',
    descriptionKey: 'help.tips.cmdPalette.description',
    actionLabelKey: 'help.tips.cmdPalette.actionLabel',
    actionId: 'OPEN_CMD',
  },
  {
    id: 'api-key',
    icon: Key,
    titleKey: 'help.tips.apiKey.title',
    descriptionKey: 'help.tips.apiKey.description',
    actionLabelKey: 'help.tips.apiKey.actionLabel',
    actionId: 'NAV_SETTINGS_APIKEY',
  },
  {
    id: 'voice-control',
    icon: Mic,
    titleKey: 'help.tips.voiceControl.title',
    descriptionKey: 'help.tips.voiceControl.description',
    actionLabelKey: 'help.tips.voiceControl.actionLabel',
    actionId: 'NAV_SETTINGS_SPEECH',
  },
  {
    id: 'shopping-generate',
    icon: ShoppingCart,
    titleKey: 'help.tips.shoppingGenerate.title',
    descriptionKey: 'help.tips.shoppingGenerate.description',
    actionLabelKey: 'help.tips.shoppingGenerate.actionLabel',
    actionId: 'NAV_SHOPPING',
  },
  {
    id: 'meal-planner',
    icon: CalendarDays,
    titleKey: 'help.tips.mealPlanner.title',
    descriptionKey: 'help.tips.mealPlanner.description',
    actionLabelKey: 'help.tips.mealPlanner.actionLabel',
    actionId: 'NAV_MEAL_PLANNER',
  },
  {
    id: 'ai-chef',
    icon: ChefHat,
    titleKey: 'help.tips.aiChef.title',
    descriptionKey: 'help.tips.aiChef.description',
    actionLabelKey: 'help.tips.aiChef.actionLabel',
    actionId: 'NAV_AI_CHEF',
  },
];

export const QUICK_LINKS: QuickLinkEntry[] = [
  {
    id: 'data',
    icon: Database,
    labelKey: 'help.quickLinks.data.label',
    descriptionKey: 'help.quickLinks.data.description',
    settingsFocus: 'data',
  },
  {
    id: 'privacy',
    icon: Lock,
    labelKey: 'help.quickLinks.privacy.label',
    descriptionKey: 'help.quickLinks.privacy.description',
    settingsFocus: 'privacy',
  },
  {
    id: 'local-ai',
    icon: Sparkles,
    labelKey: 'help.quickLinks.localAi.label',
    descriptionKey: 'help.quickLinks.localAi.description',
    settingsFocus: 'localAi',
  },
  {
    id: 'appearance',
    icon: Smartphone,
    labelKey: 'help.quickLinks.appearance.label',
    descriptionKey: 'help.quickLinks.appearance.description',
    settingsFocus: 'appearance',
  },
  {
    id: 'policies',
    icon: ShieldCheck,
    labelKey: 'help.quickLinks.policies.label',
    descriptionKey: 'help.quickLinks.policies.description',
    settingsFocus: 'policies',
  },
  {
    id: 'all-settings',
    icon: Settings,
    labelKey: 'help.quickLinks.allSettings.label',
    descriptionKey: 'help.quickLinks.allSettings.description',
    settingsFocus: 'modules',
  },
];

export const TECH_STACK = [
  { id: 'react', name: 'React 19', icon: '⚛️', descKey: 'help.tech.react' },
  { id: 'gemini', name: 'Google Gemini', icon: '🧠', descKey: 'help.tech.gemini' },
  { id: 'ollama', name: 'Ollama / Local AI', icon: '🏠', descKey: 'help.tech.ollama' },
  { id: 'dexie', name: 'Dexie.js', icon: '🗄️', descKey: 'help.tech.dexie' },
  { id: 'redux', name: 'Redux Toolkit', icon: '🔄', descKey: 'help.tech.redux' },
  { id: 'zustand', name: 'Zustand', icon: '⚡', descKey: 'help.tech.zustand' },
  { id: 'tailwind', name: 'Tailwind CSS', icon: '🎨', descKey: 'help.tech.tailwind' },
  { id: 'vite', name: 'Vite PWA', icon: '📱', descKey: 'help.tech.vite' },
];

export const PHILOSOPHY = [
  {
    id: 'offlineFirst',
    icon: WifiOff,
    titleKey: 'help.philosophy.offlineFirst.title',
    descKey: 'help.philosophy.offlineFirst.description',
  },
  {
    id: 'privacy',
    icon: ShieldCheck,
    titleKey: 'help.philosophy.privacy.title',
    descKey: 'help.philosophy.privacy.description',
  },
  {
    id: 'performance',
    icon: Zap,
    titleKey: 'help.philosophy.performance.title',
    descKey: 'help.philosophy.performance.description',
  },
  {
    id: 'trust',
    icon: Heart,
    titleKey: 'help.philosophy.trust.title',
    descKey: 'help.philosophy.trust.description',
  },
  {
    id: 'open',
    icon: Cloud,
    titleKey: 'help.philosophy.open.title',
    descKey: 'help.philosophy.open.description',
  },
  {
    id: 'sync',
    icon: QrCode,
    titleKey: 'help.philosophy.sync.title',
    descKey: 'help.philosophy.sync.description',
  },
];
