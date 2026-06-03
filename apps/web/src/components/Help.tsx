
import React, { useState, useCallback } from 'react';
import { Search, Book, Info, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../store/hooks';
import { setCurrentPage } from '../store/slices/uiSlice';
import { useTransientUiStore } from '../store/transientUiStore';
import { FaqSection, TipsSection, AboutSection, QuickLinksSection } from './help/HelpComponents';
import type { HelpActionId, HelpSettingsFocus } from './help/helpData';

interface HelpProps {
  appVersion: string;
}

const Help: React.FC<HelpProps> = ({ appVersion }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const setCommandPaletteOpen = useTransientUiStore((s) => s.setCommandPaletteOpen);

  const [activeTab, setActiveTab] = useState<'knowledge' | 'about'>('knowledge');
  const [searchTerm, setSearchTerm] = useState('');

  const openSettings = useCallback(
    (focus: HelpSettingsFocus) => {
      dispatch(setCurrentPage({ page: 'settings', focusTarget: focus }));
    },
    [dispatch],
  );

  const handleAction = useCallback(
    (actionId: HelpActionId | string) => {
      switch (actionId) {
        case 'OPEN_CMD':
          setCommandPaletteOpen(true);
          break;
        case 'NAV_SHOPPING':
          dispatch(setCurrentPage({ page: 'shopping-list' }));
          break;
        case 'NAV_SETTINGS_SPEECH':
          openSettings('speech');
          break;
        case 'NAV_SETTINGS_APIKEY':
          openSettings('apikey');
          break;
        case 'NAV_SETTINGS_DATA':
          openSettings('data');
          break;
        case 'NAV_SETTINGS_PRIVACY':
          openSettings('privacy');
          break;
        case 'NAV_SETTINGS_LOCAL_AI':
          openSettings('localAi');
          break;
        case 'NAV_SETTINGS_POLICIES':
          openSettings('policies');
          break;
        case 'NAV_SETTINGS':
          dispatch(setCurrentPage({ page: 'settings' }));
          break;
        case 'NAV_AI_CHEF':
          dispatch(setCurrentPage({ page: 'chef' }));
          break;
        case 'NAV_MEAL_PLANNER':
          dispatch(setCurrentPage({ page: 'meal-planner' }));
          break;
        case 'NAV_PANTRY':
          dispatch(setCurrentPage({ page: 'pantry' }));
          break;
        case 'REPLAY_ONBOARDING':
          useTransientUiStore.getState().openOnboarding();
          break;
        default:
          break;
      }
    },
    [dispatch, openSettings, setCommandPaletteOpen],
  );

  return (
    <div className="space-y-8 pb-24 min-h-[80vh]">
      <header className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-100 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              {t('help.title')}
            </h2>
            <p className="text-zinc-400 mt-1">{t('help.subtitle')}</p>
          </div>
        </div>

        <div className="relative group max-w-2xl">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--color-accent-500)] to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
          <div className="relative flex items-center bg-zinc-900 border border-zinc-700 rounded-xl p-1 focus-within:border-[var(--color-accent-500)] focus-within:ring-1 focus-within:ring-[var(--color-accent-500)] transition-all">
            <Search className="ml-3 text-zinc-500" size={20} aria-hidden />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('help.search.placeholder')}
              aria-label={t('help.search.inputAria')}
              className="w-full bg-transparent border-none focus:ring-0 text-zinc-100 placeholder-zinc-500 h-12 px-4 text-lg"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="mr-2 p-1 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-zinc-300"
                aria-label={t('help.search.resetAria')}
              >
                <X size={18} aria-hidden />
              </button>
            )}
          </div>
        </div>
      </header>

      <div
        className="flex p-1 bg-zinc-900/50 border border-zinc-800 rounded-xl w-full sm:w-fit backdrop-blur-sm"
        role="tablist"
        aria-label={t('help.tabs.ariaLabel')}
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'knowledge'}
          onClick={() => setActiveTab('knowledge')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'knowledge' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <Book size={16} aria-hidden />
          <span>{t('help.tabs.knowledge')}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'about'}
          onClick={() => setActiveTab('about')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'about' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <Info size={16} aria-hidden />
          <span>{t('help.tabs.about')}</span>
        </button>
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'knowledge' ? (
          <div className="space-y-10 page-fade-in">
            <QuickLinksSection onOpenSettings={openSettings} />

            {!searchTerm && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider pl-1">
                  {t('help.tips.heading')}
                </h3>
                <TipsSection onAction={handleAction} searchTerm={searchTerm} />
              </div>
            )}

            {searchTerm && <TipsSection onAction={handleAction} searchTerm={searchTerm} />}

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider pl-1">
                {t('help.faq.heading')}
              </h3>
              <FaqSection searchTerm={searchTerm} onOpenSettings={openSettings} />
            </div>
          </div>
        ) : (
          <AboutSection appVersion={appVersion} />
        )}
      </div>
    </div>
  );
};

export default Help;
