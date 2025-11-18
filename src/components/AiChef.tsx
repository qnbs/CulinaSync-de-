import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { generateRecipeIdeasAsync, generateFullRecipeAsync, resetAiChef, backToIdeas } from '../store/slices/aiChefSlice';
import { RecipeIdea, StructuredPrompt } from '../types';
import RecipeDetail from './RecipeDetail';
import { ChefInput } from './ai-chef/ChefInput';
import { ChefLoading } from './ai-chef/ChefLoading';
import { ChefResults } from './ai-chef/ChefResults';
import { AlertTriangle } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { addToast, setFocusAction, setVoiceAction } from '../store/slices/uiSlice';

const HISTORY_KEY = 'culinaSyncAiChefHistory';
const MAX_HISTORY = 5;

const AiChef: React.FC = () => {
  const dispatch = useAppDispatch();
  const { status, ideas: recipeIdeas, recipe: finalRecipe, error } = useAppSelector((state) => state.aiChef);
  const { voiceAction, focusAction } = useAppSelector(state => state.ui);

  const [craving, setCraving] = useState('');
  const [includeIngredients, setIncludeIngredients] = useState<string[]>([]);
  const [excludeIngredients, setExcludeIngredients] = useState<string[]>([]);
  const [modifiers, setModifiers] = useState<string[]>([]);
  
  const promptRef = useRef<HTMLTextAreaElement>(null);

  const pantryItems = useLiveQuery(() => db.pantry.toArray(), []) ?? [];

  const [history, setHistory] = useState<StructuredPrompt[]>(() => {
    try { const saved = localStorage.getItem(HISTORY_KEY); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  const initialPrompt = voiceAction?.type === 'GENERATE_RECIPE' ? voiceAction.payload : undefined;

  useEffect(() => {
    if (initialPrompt) {
        setCraving(initialPrompt.split('#')[0]);
        dispatch(setVoiceAction(null));
    }
  }, [initialPrompt, dispatch]);

  useEffect(() => {
    if (focusAction === 'prompt' && promptRef.current) {
      promptRef.current.focus();
      dispatch(setFocusAction(null));
    }
  }, [focusAction, dispatch]);
  
  const updateHistory = (prompt: StructuredPrompt) => {
    const newHistory = [prompt, ...history.filter(h => JSON.stringify(h) !== JSON.stringify(prompt))].slice(0, MAX_HISTORY);
    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  };
  
  const loadFromHistory = (prompt: StructuredPrompt) => {
    setCraving(prompt.craving);
    setIncludeIngredients(prompt.includeIngredients);
    setExcludeIngredients(prompt.excludeIngredients);
    setModifiers(prompt.modifiers);
    dispatch(resetAiChef());
  }

  const handleGenerateIdeas = async () => {
    if (!craving.trim()) { 
        dispatch(addToast({ message: 'Bitte gib ein, worauf du Appetit hast.', type: 'error' }));
        return; 
    }
    const structuredPrompt: StructuredPrompt = { craving, includeIngredients, excludeIngredients, modifiers };
    dispatch(generateRecipeIdeasAsync(structuredPrompt));
    updateHistory(structuredPrompt);
  };

  const handleGenerateFullRecipe = async (chosenIdea: RecipeIdea) => {
    const structuredPrompt: StructuredPrompt = { craving, includeIngredients, excludeIngredients, modifiers };
    dispatch(generateFullRecipeAsync({ prompt: structuredPrompt, chosenIdea }));
  };

  const handleSurpriseMe = () => {
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
      return <RecipeDetail recipe={finalRecipe} onBack={() => dispatch(backToIdeas())} />
  }

  const isLoading = status === 'loadingIdeas' || status === 'loadingRecipe';

  if (isLoading) {
      return <ChefLoading />;
  }

  if (status === 'ideasReady') {
      return <ChefResults ideas={recipeIdeas} onSelectIdea={handleGenerateFullRecipe} onReset={() => dispatch(resetAiChef())} />;
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

      <ChefInput 
        craving={craving} setCraving={setCraving}
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