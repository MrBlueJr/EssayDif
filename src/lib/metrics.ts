export interface TextMetrics {
  wordCount: number;
  fleschKincaid: number;
  readingTimeMin: number;
}

export function computeMetrics(text: string): TextMetrics {
  const words = text.match(/\b\w+\b/g) || [];
  const wordCount = words.length;
  const readingTimeMin = Math.ceil(wordCount / 200); // avg reading speed

  // Rough estimation for Flesch-Kincaid
  const sentences = text.match(/[\w|)][.?!]+(\s|$)/g) || [];
  const sentenceCount = sentences.length || 1;
  
  // Very rough syllable counting heuristic
  let syllableCount = 0;
  for (const word of words) {
    const w = word.toLowerCase();
    if (w.length <= 3) {
      syllableCount += 1;
      continue;
    }
    const syllables = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
                       .replace(/^y/, '')
                       .match(/[aeiouy]{1,2}/g);
    syllableCount += syllables ? syllables.length : 1;
  }

  // Flesch-Kincaid Grade Level formula
  // 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
  let fleschKincaid = 0.39 * (wordCount / sentenceCount) + 11.8 * (syllableCount / (wordCount || 1)) - 15.59;
  fleschKincaid = Math.max(0, Math.round(fleschKincaid * 10) / 10);

  return { wordCount, fleschKincaid, readingTimeMin };
}
