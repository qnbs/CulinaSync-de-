import React from 'react';
import type { NutritionAllergyReport } from '../../services/nutritionAllergyService';
import type { TFunction } from 'i18next';
import { BarChart, ShieldAlert, LoaderCircle, CheckCircle, Lightbulb } from 'lucide-react';

interface NutritionPanelProps {
  report: NutritionAllergyReport;
  isNutritionLoading: boolean;
  isGeminiCheckLoading: boolean;
  geminiVerification: { summary: string; warnings: string[] } | null;
  handleGeminiNutritionCheck: () => void;
  t: TFunction;
}

export const NutritionPanel: React.FC<NutritionPanelProps> = ({
  report,
  isNutritionLoading,
  isGeminiCheckLoading,
  geminiVerification,
  handleGeminiNutritionCheck,
  t
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <BarChart size={20} className="text-[var(--color-accent-400)]" />
        <h3 className="text-lg font-bold">{t('recipeDetail.nutrition')}</h3>
      </div>

      {isNutritionLoading ? (
        <div className="text-center py-4 text-zinc-400">
          <LoaderCircle size={24} className="animate-spin mx-auto mb-2" />
          <p>{t('recipeDetail.nutritionCalculating')}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 text-zinc-300">
            <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="p-2 bg-[var(--color-accent-500)]/20 rounded-full text-[var(--color-accent-400)]">
                  <BarChart size={20} />
                </div>
              </div>
              <div>
                <div className="font-medium">{t('recipeDetail.nutrition.calories')}</div>
                <div className="text-sm">{report.calories} kcal</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="p-2 bg-[var(--color-accent-500)]/20 rounded-full text-[var(--color-accent-400)]">
                  <BarChart size={20} />
                </div>
              </div>
              <div>
                <div className="font-medium">{t('recipeDetail.nutrition.protein')}</div>
                <div className="text-sm">{report.protein}g</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="p-2 bg-[var(--color-accent-500)]/20 rounded-full text-[var(--color-accent-400)]">
                  <BarChart size={20} />
                </div>
              </div>
              <div>
                <div className="font-medium">{t('recipeDetail.nutrition.fat')}</div>
                <div className="text-sm">{report.fat}g</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="p-2 bg-[var(--color-accent-500)]/20 rounded-full text-[var(--color-accent-400)]">
                  <BarChart size={20} />
                </div>
              </div>
              <div>
                <div className="font-medium">{t('recipeDetail.nutrition.carbs')}</div>
                <div className="text-sm">{report.carbs}g</div>
              </div>
            </div>
          </div>

          {report.allergens.length > 0 && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-800 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <ShieldAlert size={20} className="text-red-400" />
                <h4 className="font-bold text-red-300">{t('recipeDetail.allergensDetected')}</h4>
              </div>
              <ul className="list-disc list-inside text-red-300 text-sm space-y-1">
                {report.allergens.map((allergen, index) => (
                  <li key={index}>{allergen}</li>
                ))}
              </ul>
            </div>
          )}

          {report.allergens.length === 0 && report.matchedIngredients > 0 && (
            <div className="mt-4 p-3 bg-green-900/50 border border-green-800 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-green-400" />
                <span className="text-green-300">{t('recipeDetail.noAllergensDetected')}</span>
              </div>
            </div>
          )}

          {geminiVerification && (
            <div className="mt-4 p-3 bg-blue-900/50 border border-blue-800 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Lightbulb size={20} className="text-blue-400" />
                <h4 className="font-bold text-blue-300">{t('recipeDetail.geminiVerification')}</h4>
              </div>
              <p className="text-blue-300">{geminiVerification.summary}</p>
              {geminiVerification.warnings.length > 0 && (
                <ul className="mt-2 list-disc list-inside text-blue-300 text-sm space-y-1">
                  {geminiVerification.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {!isGeminiCheckLoading && !geminiVerification && (
            <button
              onClick={handleGeminiNutritionCheck}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-accent-500)]/20 text-[var(--color-accent-400)] hover:bg-[var(--color-accent-500)]/30 transition-colors text-sm font-medium"
            >
              <>
                <Lightbulb size={16} />
                <span>{t('recipeDetail.verifyWithGemini')}</span>
              </>
            </button>
          )}

          {isGeminiCheckLoading && (
            <div className="mt-4 text-center py-2 text-zinc-400">
              <LoaderCircle size={20} className="animate-spin mx-auto mb-2" />
              <p>{t('recipeDetail.geminiChecking')}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
