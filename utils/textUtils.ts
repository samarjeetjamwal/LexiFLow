import { TextStats } from '../types';

export const calculateStats = (text: string): TextStats => {
  const trimmed = text.trim();
  if (!trimmed) {
    return { wordCount: 0, charCount: 0, readabilityScore: 0, readingTime: 0 };
  }

  const words = trimmed.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const charCount = text.length;

  // Estimate syllables (rough heuristic)
  const syllableCount = words.reduce((count, word) => {
    return count + estimateSyllables(word);
  }, 0);

  // Estimate sentences
  const sentenceCount = (text.match(/[.!?]+/g) || []).length || 1;

  // Flesch-Kincaid Reading Ease
  // Formula: 206.835 - (1.015 * ASL) - (84.6 * ASW)
  // ASL = Average Sentence Length (words/sentences)
  // ASW = Average Syllables per Word (syllables/words)
  const asl = wordCount / sentenceCount;
  const asw = syllableCount / wordCount;
  let score = 206.835 - (1.015 * asl) - (84.6 * asw);
  
  // Clamp score
  score = Math.max(0, Math.min(100, score));

  // Avg reading speed ~200 wpm
  const readingTime = Math.ceil((wordCount / 200) * 60);

  return {
    wordCount,
    charCount,
    readabilityScore: parseFloat(score.toFixed(1)),
    readingTime
  };
};

const estimateSyllables = (word: string): number => {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const syllables = word.match(/[aeiouy]{1,2}/g);
  return syllables ? syllables.length : 1;
};

export const getReadabilityLabel = (score: number): { label: string; color: string } => {
  if (score >= 90) return { label: 'Very Easy', color: 'text-green-600' };
  if (score >= 80) return { label: 'Easy', color: 'text-green-500' };
  if (score >= 70) return { label: 'Fairly Easy', color: 'text-teal-500' };
  if (score >= 60) return { label: 'Standard', color: 'text-blue-500' };
  if (score >= 50) return { label: 'Fairly Difficult', color: 'text-yellow-600' };
  if (score >= 30) return { label: 'Difficult', color: 'text-orange-500' };
  return { label: 'Very Confusing', color: 'text-red-600' };
};
