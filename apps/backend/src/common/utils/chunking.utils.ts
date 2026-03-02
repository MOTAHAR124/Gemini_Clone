export interface TextChunk {
  text: string;
  index: number;
}

export function chunkText(content: string, chunkSize = 1200, overlap = 200): TextChunk[] {
  const normalized = content.replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return [];
  }

  const chunks: TextChunk[] = [];
  let start = 0;
  let index = 0;

  while (start < normalized.length) {
    const end = Math.min(normalized.length, start + chunkSize);
    const text = normalized.slice(start, end).trim();
    if (text.length > 0) {
      chunks.push({ text, index });
      index += 1;
    }
    if (end === normalized.length) {
      break;
    }
    start = Math.max(0, end - overlap);
  }

  return chunks;
}