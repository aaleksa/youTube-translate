export interface ParsedFlashcardItem {
  word: string;
  translation: string;
  example: string;
}

function isNumberedItemLine(line: string): boolean {
  return /^\s*\d+[\.\)]\s+/.test(line);
}

function isTopLevelBulletLine(line: string): boolean {
  return /^\s{0,2}[\-*•]\s+/.test(line);
}

function isSubBulletLine(line: string): boolean {
  return /^\s{3,}[\-*•]\s+/.test(line);
}

function isListItemLine(line: string): boolean {
  return isNumberedItemLine(line) || isTopLevelBulletLine(line);
}

function isIntroText(text: string): boolean {
  const lower = text.toLowerCase().trim();
  const introPatterns = [
    /^ось\s+(список|перелік|деякі)/i,
    /^ось\s+.*знайден/i,
    /^here\s+(is|are)\s+(a\s+)?(list|the|some)/i,
    /^the\s+following/i,
    /^below\s+is/i,
    /знайдених\s+у\s+тексті/i,
    /зустрічаються\s+у\s+наведеному/i,
    /found\s+in\s+the\s+text/i,
    /^phrasal\s+verbs?\s+(found|in|from)/i,
    /^фразов(і|их)\s+дієсл(о|а)/i,
    /^keywords?\s+(found|in|from)/i,
    /^ключов(і|их)\s+сл(ово|ів)/i,
    /^використовується/i,
    /^used\s+(for|when|to)\b/i,
    /^може\s+бути\s+використано/i,
    /^вживається/i,
  ];

  return introPatterns.some((pattern) => pattern.test(lower));
}

function isOutroText(text: string): boolean {
  const lower = text.toLowerCase().trim();
  const outroPatterns = [
    /^ці\s+фразов/i,
    /^ці\s+слова/i,
    /^these\s+phrasal/i,
    /^these\s+(words|phrases)/i,
    /^they\s+(can|may)\s+be\s+(useful|helpful)/i,
    /^це\s+може\s+бути\s+корисн/i,
    /можуть\s+бути\s+корисн/i,
  ];

  return outroPatterns.some((pattern) => pattern.test(lower));
}

function looksLikeFlashcardWord(word: string): boolean {
  const trimmed = word.trim();
  if (!trimmed || isIntroText(trimmed)) return false;
  if (trimmed.length > 50) return false;
  if (trimmed.split(/\s+/).length > 6) return false;
  return true;
}

function splitIntoBlocks(text: string): string[] {
  const lines = text.split('\n');
  const hasNumberedItems = lines.some(isNumberedItemLine);
  const blocks: string[] = [];
  let current = '';
  let seenFirstItem = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const isNewItem =
      isNumberedItemLine(line) ||
      (isTopLevelBulletLine(line) &&
        !isSubBulletLine(line) &&
        !hasNumberedItems);

    if (isNewItem) {
      if (current.trim() && (!hasNumberedItems || seenFirstItem)) {
        blocks.push(current.trim());
      }
      seenFirstItem = true;
      if (isNumberedItemLine(line)) {
        current = line.replace(/^\s*\d+[\.\)]\s+/, '').trim();
      } else {
        current = line.replace(/^\s{0,2}[\-*•]\s+/, '').trim();
      }
      continue;
    }

    if (hasNumberedItems && !seenFirstItem) continue;

    if (isOutroText(trimmed)) {
      if (current.trim() && seenFirstItem) blocks.push(current.trim());
      current = '';
      break;
    }

    current = current ? `${current}\n${trimmed}` : trimmed;
  }

  if (current.trim() && (!hasNumberedItems || seenFirstItem)) {
    blocks.push(current.trim());
  }

  return blocks;
}

function stripMarkdown(text: string): string {
  return text.replace(/\*\*/g, '').replace(/^#+\s*/, '').trim();
}

function parseHeadline(headline: string): { word: string; translation: string } | null {
  const trimmed = headline.trim();
  if (!trimmed) return null;

  const boldMatch = trimmed.match(/\*\*([^*]+)\*\*/);
  if (boldMatch) {
    const rest = trimmed.replace(/\*\*[^*]+\*\*/, '').trim();
    const translation = rest.replace(/^[-–—:]+\s*/, '').trim();
    return {
      word: boldMatch[1].trim(),
      translation,
    };
  }

  const cleaned = stripMarkdown(trimmed);

  const pipeParts = cleaned.split('|').map((part) => part.trim());
  if (pipeParts.length >= 2) {
    const second = pipeParts[1];
    const looksLikeSentence =
      /[.!?]/.test(second) && second.split(/\s+/).length > 5;
    if (pipeParts.length >= 3 && looksLikeSentence) {
      return {
        word: pipeParts[0],
        translation: pipeParts[pipeParts.length - 1],
      };
    }
    if (!looksLikeSentence) {
      return { word: pipeParts[0], translation: second };
    }
    return { word: pipeParts[0], translation: pipeParts[2] ?? '' };
  }

  const dashMatch = cleaned.match(/^(.+?)\s+[-–—]\s+(.+)$/);
  if (dashMatch) {
    return {
      word: dashMatch[1].trim(),
      translation: dashMatch[2].trim(),
    };
  }

  const colonMatch = cleaned.match(/^([^:]+):\s*(.+)$/);
  if (colonMatch && colonMatch[2].split(/\s+/).length <= 8) {
    return {
      word: colonMatch[1].trim(),
      translation: colonMatch[2].trim(),
    };
  }

  return null;
}

function normalizeTranslation(translation: string): string {
  return translation.replace(/[.!?]+\s*$/, '').trim();
}

function extractQuotedExample(lines: string[]): string {
  for (const line of lines.slice(1)) {
    if (isIntroText(line) || isOutroText(line)) continue;

    const cleaned = line.replace(/^\s*[\-*•]\s+/, '').trim();
    const match =
      cleaned.match(/"([^"]+)"/) ??
      cleaned.match(/'([^']+)'/) ??
      cleaned.match(/«([^»]+)»/);

    if (match) return match[1].trim();
  }

  return '';
}

function parseBlock(block: string): ParsedFlashcardItem | null {
  const lines = block
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const headline = lines[0]?.replace(/^\s*[\-*•]\s+/, '') ?? '';
  if (!headline || isIntroText(headline)) return null;

  const headlineParsed = parseHeadline(headline);
  if (headlineParsed?.word) {
    return {
      word: headlineParsed.word,
      translation: normalizeTranslation(headlineParsed.translation),
      example: extractQuotedExample(lines),
    };
  }

  const cleaned = stripMarkdown(headline);
  if (!cleaned) return null;

  const words = cleaned.split(/\s+/);
  if (words.length <= 4) {
    return { word: cleaned, example: '', translation: '' };
  }

  return null;
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
        Boolean(
          item?.word.trim() &&
            looksLikeFlashcardWord(item.word) &&
            (item.translation.trim() || item.word.trim())
        )
    );

  const unique = new Map<string, ParsedFlashcardItem>();
  for (const item of items) {
    const key = item.word.toLowerCase();
    if (!unique.has(key)) unique.set(key, item);
  }

  return Array.from(unique.values());
}
