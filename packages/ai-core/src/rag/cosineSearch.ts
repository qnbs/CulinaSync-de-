export type ScoredVector<TMeta> = {
  score: number;
  meta: TMeta;
};

export const cosineSimilarity = (left: readonly number[], right: readonly number[]): number => {
  const length = Math.min(left.length, right.length);
  if (length === 0) {
    return 0;
  }

  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;

  for (let index = 0; index < length; index += 1) {
    const leftValue = left[index] ?? 0;
    const rightValue = right[index] ?? 0;
    dot += leftValue * rightValue;
    leftNorm += leftValue * leftValue;
    rightNorm += rightValue * rightValue;
  }

  const denominator = Math.sqrt(leftNorm) * Math.sqrt(rightNorm);
  return denominator === 0 ? 0 : dot / denominator;
};

export const rankByCosineSimilarity = <TMeta>(
  query: readonly number[],
  candidates: Array<{ vector: readonly number[]; meta: TMeta }>,
  limit: number,
): ScoredVector<TMeta>[] =>
  candidates
    .map((candidate) => ({
      score: cosineSimilarity(query, candidate.vector),
      meta: candidate.meta,
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
