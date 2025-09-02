
import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/services/db';
import { generateRecipe } from '@/services/geminiService';
import { Recipe } from '@/types';
import RecipeCard from '@/components/RecipeCard';
import RecipeDetail from '@/components/RecipeDetail';
import { Sparkles, LoaderCircle, AlertTriangle } from 'lucide-react';
import { loadSettings } from '@/services/settingsService';

interface AiChefProps {
    initialPrompt?: string;
    focusAction?: string | null;
    onActionHandled?: () => void;
}

const AiChef: React.FC<AiChefProps> = ({ initialPrompt, focusAction, onActionHandled }) => {
  const [prompt, setPrompt] = useState('');
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if(initialPrompt) {
        setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    if (focusAction === 'prompt' && promptRef.current) {
        promptRef.current.focus();
        onActionHandled?.();
    }
  }, [focusAction, onActionHandled]);

  const handleGenerateRecipe = async () => {
    if (!prompt.trim()) {
      setError('Bitte gib ein, worauf du Appetit hast.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedRecipe(null);
    setSelectedRecipe(null);

    try {
      const pantryItems = await db.pantry.toArray();
      const settings = loadSettings();
      const recipe = await generateRecipe(prompt, pantryItems, settings.aiPreferences);
      setGeneratedRecipe(recipe);
    } catch (e: any) {
      console.error(e);
      if (e.message.startsWith('API_KEY_MISSING')) {
        setError('Konfigurationsfehler: Der KI-Dienst ist nicht korrekt eingerichtet.');
      } else if (e.message.startsWith('API_ERROR')) {
        setError('Verbindungsfehler: Der KI-Dienst konnte nicht erreicht werden. Bitte überprüfe dein Netzwerk und versuche es erneut.');
      } else if (e.message.startsWith('INVALID_')) {
        setError('Die KI hat eine ungewöhnliche Antwort gegeben. Möglicherweise ist sie überlastet. Bitte formuliere deine Anfrage um oder versuche es später erneut.');
      } else {
        setError('Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  if (selectedRecipe) {
      return <RecipeDetail recipe={selectedRecipe} onBack={() => setSelectedRecipe(null)} />
  }

  return (
    <div className="space-y-8">
       <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-100">KI-Chef</h2>
        <p className="text-zinc-400 mt-1">Sag mir, worauf du Lust hast, und ich erstelle ein Rezept aus deiner Vorratskammer.</p>
      </div>

      <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-4 sm:p-6 space-y-4">
        <textarea
          ref={promptRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="z.B. ein schnelles, gesundes Mittagessen mit Tomaten und Knoblauch..."
          className="w-full bg-zinc-800 border-zinc-700 rounded-md p-3 h-24 focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
          disabled={isLoading}
        />
        <button
          onClick={handleGenerateRecipe}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-amber-500 text-zinc-900 font-bold py-3 px-4 rounded-md hover:bg-amber-400 transition-colors disabled:bg-zinc-600 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <LoaderCircle size={20} className="animate-spin" />
              Generiere...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Rezept generieren
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-4 bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold">Generierung fehlgeschlagen</h4>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {generatedRecipe && (
        <div>
           <h3 className="text-2xl font-bold tracking-tight text-zinc-100 mb-4">Dein generiertes Rezept</h3>
           <RecipeCard recipe={generatedRecipe} onSelectRecipe={setSelectedRecipe} />
        </div>
      )}
    </div>
  );
};

export default AiChef;