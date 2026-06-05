export type LocalAiRagChunk = {
  sourceType: 'recipe' | 'pantry' | 'mealPlan';
  sourceId: number;
  text: string;
  score: number;
};

export type LocalAiRagContext = {
  chunks: LocalAiRagChunk[];
  promptBlock: string;
  retrievalMode: 'keyword' | 'hybrid' | 'semantic';
};
