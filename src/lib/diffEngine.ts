import { diff_match_patch } from 'diff-match-patch';

export type DiffType = 'equal' | 'insert' | 'delete' | 'moved' | 'paraphrased' | 'punctuation';

export interface DiffToken {
  type: DiffType;
  text: string;
}

export interface ParagraphDiff {
  id: string;
  originalIndex?: number;
  newIndex?: number;
  type: 'equal' | 'moved' | 'added' | 'deleted' | 'modified';
  tokensA?: DiffToken[]; // for deleted or modified
  tokensB?: DiffToken[]; // for added or modified
  textA?: string;
  textB?: string;
}

const dmp = new diff_match_patch();

// Helper to tokenize into words and punctuation
function tokenize(text: string): string[] {
  // Split by whitespace and punctuation, keeping punctuation as separate tokens
  const regex = /([\s]+|[\w]+|[^\s\w]+)/g;
  return text.match(regex) || [];
}

// Compute Jaccard similarity between two strings
function jaccardSimilarity(text1: string, text2: string): number {
  const set1 = new Set(text1.toLowerCase().match(/\w+/g) || []);
  const set2 = new Set(text2.toLowerCase().match(/\w+/g) || []);
  if (set1.size === 0 && set2.size === 0) return 1;
  if (set1.size === 0 || set2.size === 0) return 0;
  
  let intersection = 0;
  for (const word of set1) {
    if (set2.has(word)) intersection++;
  }
  return intersection / (set1.size + set2.size - intersection);
}

function computeWordDiff(textA: string, textB: string): { tokensA: DiffToken[], tokensB: DiffToken[] } {
  const tokenArray: string[] = [];
  const tokenHash: Record<string, number> = {};

  function charsMap(text: string) {
    const tokens = text.match(/([\s]+|[\w]+|[^\s\w]+)/g) || [];
    let chars = '';
    for (const token of tokens) {
      if (tokenHash.hasOwnProperty(token)) {
        chars += String.fromCharCode(tokenHash[token]);
      } else {
        const id = tokenArray.length;
        tokenHash[token] = id;
        tokenArray[id] = token;
        chars += String.fromCharCode(id);
      }
    }
    return chars;
  }

  const chars1 = charsMap(textA);
  const chars2 = charsMap(textB);
  
  const diffs = dmp.diff_main(chars1, chars2, false);
  
  // Recreate the actual text for the diffs
  for (let x = 0; x < diffs.length; x++) {
    const chars = diffs[x][1];
    let text = '';
    for (let y = 0; y < chars.length; y++) {
      text += tokenArray[chars.charCodeAt(y)];
    }
    diffs[x][1] = text;
  }

  // Now diffs is an array of [operation, text]
  const tokensA: DiffToken[] = [];
  const tokensB: DiffToken[] = [];

  for (const [op, text] of diffs) {
    if (op === 0) {
      tokensA.push({ type: 'equal', text });
      tokensB.push({ type: 'equal', text });
    } else if (op === -1) {
      // Deletion from A
      tokensA.push({ type: isPunctuationOnly(text) ? 'punctuation' : 'delete', text });
    } else if (op === 1) {
      // Insertion into B
      tokensB.push({ type: isPunctuationOnly(text) ? 'punctuation' : 'insert', text });
    }
  }

  return { tokensA, tokensB };
}

function isPunctuationOnly(text: string): boolean {
  return /^[\s\p{P}]+$/u.test(text);
}

export function compareEssays(textA: string, textB: string): ParagraphDiff[] {
  const parasA = textA.split(/\n\s*\n/).filter(p => p.trim());
  const parasB = textB.split(/\n\s*\n/).filter(p => p.trim());

  const result: ParagraphDiff[] = [];
  const matchedB = new Set<number>();
  const matchesA = new Map<number, number>(); // A index -> B index

  // Greedy match
  for (let i = 0; i < parasA.length; i++) {
    let bestMatch = -1;
    let bestScore = 0.3; // threshold for matching

    for (let j = 0; j < parasB.length; j++) {
      if (matchedB.has(j)) continue;
      
      const score = jaccardSimilarity(parasA[i], parasB[j]);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = j;
      }
    }

    if (bestMatch !== -1) {
      matchesA.set(i, bestMatch);
      matchedB.add(bestMatch);
    }
  }

  // Now construct the diff stream based on B's order, injecting deleted A paras appropriately
  let idxA = 0;
  for (let j = 0; j < parasB.length; j++) {
    // Check if there are deleted paras in A before the next match
    while (idxA < parasA.length && !matchesA.has(idxA)) {
      result.push({
        id: `del-${idxA}`,
        originalIndex: idxA,
        type: 'deleted',
        textA: parasA[idxA],
        tokensA: [{ type: 'delete', text: parasA[idxA] }]
      });
      idxA++;
    }

    // Is this B para matched?
    const matchA = Array.from(matchesA.entries()).find(([aIdx, bIdx]) => bIdx === j);
    
    if (matchA) {
      const aIdx = matchA[0];
      const isMoved = aIdx !== j; // simple heuristic for moved, can be improved
      
      if (parasA[aIdx] === parasB[j]) {
        result.push({
          id: `eq-${j}`,
          originalIndex: aIdx,
          newIndex: j,
          type: isMoved ? 'moved' : 'equal',
          textA: parasA[aIdx],
          textB: parasB[j],
          tokensA: [{ type: 'equal', text: parasA[aIdx] }],
          tokensB: [{ type: 'equal', text: parasB[j] }]
        });
      } else {
        const { tokensA, tokensB } = computeWordDiff(parasA[aIdx], parasB[j]);
        result.push({
          id: `mod-${j}`,
          originalIndex: aIdx,
          newIndex: j,
          type: 'modified',
          textA: parasA[aIdx],
          textB: parasB[j],
          tokensA,
          tokensB
        });
      }
      
      if (aIdx >= idxA) idxA = aIdx + 1;
    } else {
      // Added in B
      result.push({
        id: `add-${j}`,
        newIndex: j,
        type: 'added',
        textB: parasB[j],
        tokensB: [{ type: 'insert', text: parasB[j] }]
      });
    }
  }

  // Add any remaining deleted A paras
  while (idxA < parasA.length) {
    if (!matchesA.has(idxA)) {
      result.push({
        id: `del-${idxA}`,
        originalIndex: idxA,
        type: 'deleted',
        textA: parasA[idxA],
        tokensA: [{ type: 'delete', text: parasA[idxA] }]
      });
    }
    idxA++;
  }

  return result;
}
