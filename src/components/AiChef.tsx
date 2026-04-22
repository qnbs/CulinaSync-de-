import React, { useDeferredValue, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { RecipeIdea, StructuredPrompt } from '../types';
import RecipeDetail from './RecipeDetail';
import { ChefInput } from './ai-chef/ChefInput';
import { ChefLoading } from './ai-chef/ChefLoading';
import { ChefResults } from './ai-chef/ChefResults';
import { AlertTriangle } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/dbInstance';
import { addToast, setFocusAction, setVoiceAction } from '../store/slices/uiSlice';
import { hasApiKey } from '../services/apiKeyService';
import { useAiChef } from '../features/ai-chef/hooks/useAiChef';

const HISTORY_KEY = 'culinaSyncAiChefHistory';
const MAX_HISTORY = 5;

const AiChef: React.FC = () => {
  const dispatch = useAppDispatch();
  const { voiceAction, focusAction } = useAppSelector(state => state.ui);

  const [craving, setCraving] = useState('');
  const [includeIngredients, setIncludeIngredients] = useState<string[]>([]);
  const [excludeIngredients, setExcludeIngredients] = useState<string[]>([]);
  const [modifiers, setModifiers] = useState<string[]>([]);
  const [apiKeyConfigured, setApiKeyConfigured] = useState<boolean | null>(null);
  
  const promptRef = useRef<HTMLTextAreaElement>(null);

  const pantryItems = useLiveQuery(() => db.pantry.toArray(), []) ?? [];

  const [history, setHistory] = useState<StructuredPrompt[]>(() => {
    try { const saved = localStorage.getItem(HISTORY_KEY); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  const initialPrompt = voiceAction?.type === 'GENERATE_RECIPE' ? voiceAction.payload : undefined;
  const voiceCraving = useMemo(() => initialPrompt?.split('#')[0] ?? '', [initialPrompt]);
  const effectiveCraving = voiceCraving || craving;
  const deferredCraving = useDeferredValue(effectiveCraving);
  const currentPrompt: StructuredPrompt = {
    craving: deferredCraving,
    includeIngredients,
    excludeIngredients,
    modifiers,
  };
  const { ideas: recipeIdeas, recipe: finalRecipe, error, selectedIdea, isLoading, isLoadingRecipe, phase, generateIdeas, generateRecipe, reset, backToIdeas } = useAiChef(currentPrompt);

  const handleCravingChange = useCallback((value: string) => {
    if (initialPrompt) {
      dispatch(setVoiceAction(null));
    }
    setCraving(value);
  }, [dispatch, initialPrompt]);

  useEffect(() => {
    if (focusAction === 'prompt' && promptRef.current) {
      promptRef.current.focus();
      dispatch(setFocusAction(null));
    }
  }, [focusAction, dispatch]);

  useEffect(() => {
    hasApiKey()
      .then(setApiKeyConfigured)
      .catch(() => setApiKeyConfigured(false));
  }, [phase]);
  
  const updateHistory = (prompt: StructuredPrompt) => {
    const newHistory = [prompt, ...history.filter(h => JSON.stringify(h) !== JSON.stringify(prompt))].slice(0, MAX_HISTORY);
    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  };
  
  const loadFromHistory = (prompt: StructuredPrompt) => {
    if (initialPrompt) {
      dispatch(setVoiceAction(null));
    }
    setCraving(prompt.craving);
    setIncludeIngredients(prompt.includeIngredients);
    setExcludeIngredients(prompt.excludeIngredients);
    setModifiers(prompt.modifiers);
    reset();
  }

  const handleGenerateIdeas = async () => {
    if (!effectiveCraving.trim()) { 
        dispatch(addToast({ message: 'Bitte gib ein, worauf du Appetit hast.', type: 'error' }));
        return; 
    }
    if (initialPrompt) {
      dispatch(setVoiceAction(null));
    }
    const structuredPrompt: StructuredPrompt = { craving: effectiveCraving, includeIngredients, excludeIngredients, modifiers };
    generateIdeas(structuredPrompt);
    updateHistory(structuredPrompt);
  };

  const handleGenerateFullRecipe = async (chosenIdea: RecipeIdea) => {
    generateRecipe(chosenIdea);
  };

  const handleSurpriseMe = () => {
    if (initialPrompt) {
      dispatch(setVoiceAction(null));
    }
    if (!pantryItems || pantryItems.length === 0) { setCraving("Ein einfaches Gericht ohne viele Zutaten"); return; }
    const shuffled = [...pantryItems].sort(() => 0.5 - Math.random());
    const count = Math.min(shuffled.length, 2);
    const mainItems = shuffled.slice(0, count).map(i => i.name);
    setCraving(`Ein kreatives Gericht mit ${mainItems.join(' und ')}`);
    setIncludeIngredients([]);
    setExcludeIngredients([]);
    setModifiers(['Kreativ']);
  };
  
  if (finalRecipe) {
      return <RecipeDetail recipe={finalRecipe} onBack={backToIdeas} />
  }

  if (isLoading) {
      return <ChefLoading />;
  }

    if (phase === 'ideas') {
      return <ChefResults ideas={recipeIdeas} onSelectIdea={handleGenerateFullRecipe} onReset={reset} pendingIdeaTitle={selectedIdea?.recipeTitle} isLoading={isLoadingRecipe} />;
  }

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-100 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">KI-Chef</h2>
        <p className="text-zinc-400 mt-1">Dein persönlicher Sternekoch.</p>
      </div>

      {error && (
        <div className="flex items-start gap-4 bg-red-900/20 border border-red-500/30 text-red-300 p-4 rounded-lg page-fade-in">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div><h4 className="font-semibold">Generierung fehlgeschlagen</h4><p className="text-sm opacity-80">{error}</p></div>
        </div>
      )}

      {apiKeyConfigured === false && (
        <div className="flex items-start gap-4 bg-amber-900/20 border border-amber-500/30 text-amber-200 p-4 rounded-lg page-fade-in">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold">Gemini API-Schlüssel fehlt</h4>
            <p className="text-sm opacity-90">Bitte hinterlege deinen Schlüssel unter Einstellungen → API-Key. Ohne Schlüssel sind KI-Funktionen deaktiviert.</p>
          </div>
        </div>
      )}

      <ChefInput 
        craving={effectiveCraving} setCraving={handleCravingChange}
        includeIngredients={includeIngredients} setIncludeIngredients={setIncludeIngredients}
        excludeIngredients={excludeIngredients} setExcludeIngredients={setExcludeIngredients}
        modifiers={modifiers} setModifiers={setModifiers}
        pantryItems={pantryItems} promptRef={promptRef}
        onSubmit={handleGenerateIdeas} onSurpriseMe={handleSurpriseMe}
        history={history} onLoadHistory={loadFromHistory}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AiChef;