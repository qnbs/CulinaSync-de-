import { useState } from 'react';
import { exportNutritionToHealthCsv, exportNutritionToHealthJson, HealthExportType } from '../../../services/healthConnectService';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../services/db';
import { analyzeRecipeNutritionInWorker } from '../../../services/nutritionWorkerService';

export const HealthConnectPanel = () => {
  const recipes = useLiveQuery(() => db.recipes.toArray(), []);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('');
  const [exportType, setExportType] = useState<HealthExportType>('apple');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!recipes) return;
    const recipe = recipes.find(r => r.id === Number(selectedRecipeId));
    if (!recipe) return;
    setIsExporting(true);
    const nutrition = await analyzeRecipeNutritionInWorker(recipe);
    const date = new Date().toISOString();
    exportNutritionToHealthCsv({ type: exportType, date, nutrition, mealName: recipe.recipeTitle });
    setIsExporting(false);
  };
  const handleExportJson = async () => {
    if (!recipes) return;
    const recipe = recipes.find(r => r.id === Number(selectedRecipeId));
    if (!recipe) return;
    setIsExporting(true);
    const nutrition = await analyzeRecipeNutritionInWorker(recipe);
    const date = new Date().toISOString();
    exportNutritionToHealthJson({ type: exportType, date, nutrition, mealName: recipe.recipeTitle });
    setIsExporting(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Health Connect</h2>
      <div>
        <label className="block mb-1">Rezept wählen:</label>
        <select value={selectedRecipeId} onChange={e => setSelectedRecipeId(e.target.value)} className="w-full p-2 rounded">
          <option value="">–</option>
          {recipes && recipes.map(r => (
            <option key={r.id} value={r.id}>{r.recipeTitle}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1">Export-Format:</label>
        <select value={exportType} onChange={e => setExportType(e.target.value as HealthExportType)} className="w-full p-2 rounded">
          <option value="apple">Apple Health</option>
          <option value="google">Google Fit</option>
          <option value="samsung">Samsung Health</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button onClick={() => void handleExport()} disabled={isExporting} className="bg-[var(--color-accent-500)] text-white px-4 py-2 rounded disabled:opacity-60">CSV Export</button>
        <button onClick={() => void handleExportJson()} disabled={isExporting} className="bg-zinc-700 text-white px-4 py-2 rounded disabled:opacity-60">JSON Export</button>
      </div>
      <p className="text-xs text-zinc-400">Die Daten werden nur lokal berechnet und exportiert. Kein Upload, keine Cloud.</p>
    </div>
  );
};
