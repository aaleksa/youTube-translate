export interface ParsedFlashcardItem {
  word: string;
  translation: string;
  example: string;
}

function isListItemLine(line: string): boolean {
  return /^\s*(\d+[\.\)]|[\-*•])\s+/.test(line);
}

function isIntroText(text: string): boolean {
  const lower = text.toLowerCase().trim();
  const introPatterns = [
    /^ось\s+(список|перелік)/i,
    /^ось\s+.*знайден/i,
    /^here\s+(is|are)\s+(a\s+)?(list|the)/i,
    /^the\s+following/i,
    /^below\s+is/i,
    /знайдених\s+у\s+тексті/i,
    /found\s+in\s+the\s+text/i,
    /^phrasal\s+verbs?\s+(found|in|from)/i,
    /^фразов(і|их)\s+дієсл(о|а)/i,
    /^keywords?\s+(found|in|from)/i,
    /^ключов(і|их)\s+сл(ово|ів)/i,
  ];

  return introPatterns.some((pattern) => pattern.test(lower));
}

function looksLikeFlashcardWord(word: string): boolean {
  const trimmed = word.trim();
  if (!trimmed || isIntroText(trimmed)) return false;
  if (trimmed.length > 50) return false;
  if (trimmed.split(/\s+/).length > 5) return false;
  return true;
}

function splitIntoBlocks(text: string): string[] {
  const lines = text.split('\n');
  const hasListItems = lines.some(isListItemLine);
  const blocks: string[] = [];
  let current = '';
  let seenFirstItem = false;

  for (const line of lines) {
    const isNewItem = isListItemLine(line);
    if (isNewItem) {
      if (current.trim() && (!hasListItems || seenFirstItem)) {
        blocks.push(current.trim());
      }
      seenFirstItem = true;
      current = line.replace(/^\s*(\d+[\.\)]|[\-*•])\s+/, '').trim();
      continue;
    }
    if (line.trim()) {
      if (hasListItems && !seenFirstItem) continue;
      current = current ? `${current}\n${line.trim()}` : line.trim();
    }
  }

  if (current.trim() && (!hasListItems || seenFirstItem)) {
    blocks.push(current.trim());
  }

  return blocks;
}

function stripMarkdown(text: string): string {
  return text.replace(/\*\*/g, '').replace(/^#+\s*/, '').trim();
}

function parseBlock(block: string): ParsedFlashcardItem | null {
  const cleaned = stripMarkdown(block);
  if (!cleaned) return null;

  const pipeParts = cleaned.split('|').map((part) => part.trim());
  if (pipeParts.length >= 3) {
    return {
      word: pipeParts[0],
      example: pipeParts.slice(1, -1).join(' | '),
      translation: pipeParts[pipeParts.length - 1],
    };
  }
  if (pipeParts.length === 2) {
    const second = pipeParts[1];
    const looksLikeSentence =
      /[.!?]/.test(second) || second.split(/\s+/).length > 5;
    if (looksLikeSentence) {
      return { word: pipeParts[0], example: second, translation: '' };
    }
    return { word: pipeParts[0], example: '', translation: second };
  }

  const quoteMatch =
    cleaned.match(/"([^"]+)"/) ??
    cleaned.match(/'([^']+)'/) ??
    cleaned.match(/«([^»]+)»/);
  const example = quoteMatch?.[1]?.trim() ?? '';

  let remainder = cleaned;
  if (quoteMatch) {
    remainder = cleaned.replace(quoteMatch[0], ' ').replace(/\s+/g, ' ').trim();
  }

  const labeledWord = remainder.match(
    /^(?:phrasal verb|verb|word|keyword)[:\s]+(.+?)(?:\s*[-–—:]\s*|$)/i
  );
  const labeledMeaning = remainder.match(
    /(?:meaning|translation|переклад)[:\s]+(.+)$/i
  );
  const labeledSentence = remainder.match(
    /(?:sentence|example|приклад)[:\s]+(.+?)(?:\s*(?:meaning|translation|переклад)|$)/i
  );

  if (labeledWord) {
    return {
      word: labeledWord[1].trim(),
      example: labeledSentence?.[1]?.trim() ?? example,
      translation: labeledMeaning?.[1]?.trim() ?? '',
    };
  }

  const dashParts = remainder.split(/\s+[-–—]\s+/).map((part) => part.trim());
  if (dashParts.length >= 3) {
    return {
      word: dashParts[0],
      example: dashParts[1] || example,
      translation: dashParts.slice(2).join(' - '),
    };
  }
  if (dashParts.length === 2) {
    return {
      word: dashParts[0],
      example,
      translation: dashParts[1],
    };
  }

  const colonParts = remainder.split(':').map((part) => part.trim());
  if (colonParts.length >= 2) {
    return {
      word: colonParts[0],
      example,
      translation: colonParts.slice(1).join(': '),
    };
  }

  const words = cleaned.split(/\s+/);
  if (words.length <= 4) {
    return { word: cleaned, example, translation: '' };
  }

  return {
    word: words.slice(0, 3).join(' '),
    example: example || cleaned,
    translation: '',
  };
}

export function parseFlashcardList(text: string): ParsedFlashcardItem[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const blocks = splitIntoBlocks(trimmed);
  if (blocks.length === 0) return [];

  const items = blocks
    .map(parseBlock)
    .filter(
      (item): item is ParsedFlashcardItem =>
        Boolean(item?.word.trim() && looksLikeFlashcardWord(item.word))
    );

  const unique = new Map<string, ParsedFlashcardItem>();
  for (const item of items) {
    const key = item.word.toLowerCase();
    if (!unique.has(key)) unique.set(key, item);
  }

  return Array.from(unique.values());
}
