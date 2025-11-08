import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { generateRecipeIdeasAsync, generateFullRecipeAsync, resetAiChef, backToIdeas } from '../store/slices/aiChefSlice';
import { RecipeIdea, StructuredPrompt } from '../types';
import RecipeDetail from './RecipeDetail';
import { Sparkles, LoaderCircle, AlertTriangle, Sandwich, BrainCircuit, HeartPulse, Zap, Users, RotateCcw, Wand2, ChefHat, Megaphone, Leaf, PlusCircle, MinusCircle, Redo } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import TagInput from './TagInput';
import { addToast, setFocusAction, setVoiceAction } from '../store/slices/uiSlice';

const MODIFIER_OPTIONS = [
    { label: 'Schnell (< 30 Min)', icon: Zap },
    { label: 'Gesund', icon: HeartPulse },
    { label: 'Für Gäste', icon: Users },
    { label: 'Einfach', icon: Sandwich },
    { label: 'Kreativ & Ungewöhnlich', icon: BrainCircuit }
];

const ideaLoadingMessages = ['Konsultiere die kulinarischen Archive...', 'Bewerte deine Vorratskammer...', 'Brainstorme köstliche Ideen...'];
const recipeLoadingMessages = ['Füge eine kreative Wendung hinzu...', 'Schreibe das Rezept auf...', 'Finalisiere die Kochanleitung...'];

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
  
  const [loadingMessage, setLoadingMessage] = useState('');
  const promptRef = useRef<HTMLTextAreaElement>(null);

  const pantryItems = useLiveQuery(() => db.pantry.toArray(), []);
  const pantrySuggestions = useMemo(() => pantryItems?.map(item => item.name) || [], [pantryItems]);

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
  
  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      if (status === 'loadingIdeas' || status === 'loadingRecipe') {
          const messages = status === 'loadingIdeas' ? ideaLoadingMessages : recipeLoadingMessages;
          setLoadingMessage(messages[0]);
          interval = setInterval(() => {
              setLoadingMessage(prev => messages[(messages.indexOf(prev) + 1) % messages.length]);
          }, 2500);
      }
      return () => clearInterval(interval);
  }, [status]);
  
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

  const toggleModifier = (modifier: string) => { setModifiers(prev => prev.includes(modifier) ? prev.filter(m => m !== modifier) : [...prev, modifier]); };

  const handleSurpriseMe = () => {
    if (!pantryItems || pantryItems.length === 0) { setCraving("Ein einfaches Gericht ohne viele Zutaten"); return; }
    const shuffled = [...pantryItems].sort(() => 0.5 - Math.random());
    const count = Math.min(shuffled.length, 2);
    const mainItems = shuffled.slice(0, count).map(i => i.name);
    setCraving(`Ein kreatives Gericht mit ${mainItems.join(' und ')}`);
    setIncludeIngredients([]);
    setExcludeIngredients([]);
    setModifiers([]);
  };
  
  if (finalRecipe) {
      return <RecipeDetail recipe={finalRecipe} onBack={() => dispatch(backToIdeas())} />
  }

  const isLoading = status === 'loadingIdeas' || status === 'loadingRecipe';

  return (
    <div className="space-y-8">
       <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-100 flex items-center gap-3"><Wand2/> KI-Chef</h2>
        <p className="text-zinc-400 mt-1">Beschreibe dein Verlangen und ich erstelle ein einzigartiges Rezept für dich.</p>
      </div>

    {status === 'idle' || status === 'loadingIdeas' ? (
      <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-4 sm:p-6 space-y-6">
        <section className="space-y-4">
            <h3 className="font-semibold text-[var(--color-accent-400)] flex items-center gap-2"><Megaphone size={18}/>Was schwebt dir vor?</h3>
            <textarea
              ref={promptRef} value={craving} onChange={(e) => setCraving(e.target.value)}
              placeholder="z.B. ein schnelles, gesundes Mittagessen mit Tomaten und Knoblauch..."
              className="w-full bg-zinc-800 border-zinc-700 rounded-md p-3 h-20 focus:ring-2 focus:ring-[var(--color-accent-500)] focus:outline-none resize-none"
              disabled={isLoading} />
        </section>

        <section className="space-y-4">
            <h3 className="font-semibold text-[var(--color-accent-400)] flex items-center gap-2"><Leaf size={18}/>Was ist im Vorrat?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-1.5"><PlusCircle size={14}/>Muss enthalten</label>
                   <TagInput tags={includeIngredients} setTags={setIncludeIngredients} placeholder="Zutat hinzufügen..." suggestions={pantrySuggestions.filter(p => !excludeIngredients.includes(p))}/>
                </div>
                 <div>
                   <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-1.5"><MinusCircle size={14}/>Darf nicht enthalten</label>
                   <TagInput tags={excludeIngredients} setTags={setExcludeIngredients} placeholder="Zutat hinzufügen..." suggestions={pantrySuggestions.filter(p => !includeIngredients.includes(p))}/>
                </div>
            </div>
        </section>

        <section className="space-y-4">
             <h3 className="font-semibold text-[var(--color-accent-400)] flex items-center gap-2"><ChefHat size={18}/>Gib den Ton an</h3>
             <div className="flex flex-wrap gap-2">
                {MODIFIER_OPTIONS.map(({label, icon: Icon}) => (
                    <button key={label} onClick={() => toggleModifier(label)} disabled={isLoading} className={`flex items-center gap-2 text-sm border rounded-full px-3 py-1.5 transition-colors ${modifiers.includes(label) ? 'bg-[var(--color-accent-500)] text-zinc-900 border-[var(--color-accent-500)]' : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'}`}>
                        <Icon size={16}/> {label}
                    </button>
                ))}
            </div>
        </section>

        <div className="pt-4 border-t border-zinc-700/50 flex flex-col-reverse sm:flex-row items-center gap-4">
            <button onClick={handleSurpriseMe} disabled={isLoading} className="w-full sm:w-auto flex items-center justify-center gap-2 text-[var(--color-accent-400)] font-semibold text-sm py-3 px-4 rounded-md hover:bg-[var(--color-accent-500)]/10 transition-colors disabled:text-zinc-600 disabled:cursor-not-allowed">
                <Sparkles size={16}/> Überrasch mich!
            </button>
            <button onClick={handleGenerateIdeas} disabled={isLoading || !craving.trim()} className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-[var(--color-accent-500)] text-zinc-900 font-bold py-3 px-4 rounded-md hover:bg-[var(--color-accent-400)] transition-colors disabled:bg-zinc-600 disabled:cursor-not-allowed">
              {isLoading ? ( <><LoaderCircle size={20} className="animate-spin" /> {loadingMessage}</> ) : 'Ideen finden'}
            </button>
        </div>
      </div>
    ) : null}

      {error && (
        <div className="flex items-start gap-4 bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg page-fade-in">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div><h4 className="font-semibold">Generierung fehlgeschlagen</h4><p className="text-sm">{error}</p></div>
        </div>
      )}

      {status === 'ideasReady' && (
         <div className="space-y-6 page-fade-in">
             <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h3 className="text-2xl font-bold tracking-tight text-zinc-100">Hier sind ein paar Ideen...</h3>
                <button onClick={() => dispatch(resetAiChef())} className="flex items-center gap-2 text-sm text-[var(--color-accent-400)] font-semibold py-2 px-4 rounded-md hover:bg-[var(--color-accent-500)]/10">
                    <Redo size={16}/> Neu anfangen
                </button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipeIdeas.map((idea, index) => (
                    <div key={index} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-5 flex flex-col text-center items-center justify-between gap-4">
                        <div className="space-y-2">
                           <h4 className="font-bold text-[var(--color-accent-400)] text-lg">{idea.recipeTitle}</h4>
                           <p className="text-zinc-400 text-sm">{idea.shortDescription}</p>
                        </div>
                        <button onClick={() => handleGenerateFullRecipe(idea)} disabled={isLoading} className="w-full mt-2 flex items-center justify-center gap-2 bg-zinc-700 text-white font-bold py-2 px-4 rounded-md hover:bg-zinc-600 transition-colors">
                           Rezept erstellen
                        </button>
                    </div>
                ))}
             </div>
         </div>
      )}

      {status === 'loadingRecipe' && (
           <div className="text-center p-12 bg-zinc-800/50 border border-zinc-700 rounded-lg">
               <LoaderCircle size={32} className="mx-auto text-[var(--color-accent-400)]" />
               <h3 className="text-xl font-bold tracking-tight text-zinc-100 mt-4">{loadingMessage}</h3>
           </div>
      )}
      
      {history.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-zinc-800">
              <h3 className="text-xl font-semibold text-zinc-300 flex items-center gap-2">
                  <RotateCcw size={18}/> Letzte Anfragen
              </h3>
              <div className="flex flex-wrap gap-2">
                  {history.map((prompt, index) => (
                      <button key={index} onClick={() => loadFromHistory(prompt)} className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-left text-sm text-zinc-400 rounded-md p-2 transition-colors">
                          <p className="font-medium text-zinc-200 truncate max-w-xs">{prompt.craving}</p>
                          <p className="text-xs truncate max-w-xs">{[...prompt.modifiers, ...prompt.includeIngredients].join(', ')}</p>
                      </button>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

export default AiChef;