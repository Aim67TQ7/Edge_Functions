/**
 * PURPOSE:
 * This function splits a large block of text into chunks suitable for LLM analysis,
 * preserving context where possible. It avoids breaking sentences when practical.
 */

const MAX_CHUNK_SIZE = 3000;
const MIN_CHUNK_SIZE = 1000;

export function chunkText(text: string): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n{2,}/);

  let currentChunk = "";

  for (const paragraph of paragraphs) {
    const next = paragraph.trim();
    if (!next) continue;

    if ((currentChunk + next).length < MAX_CHUNK_SIZE) {
      currentChunk += (currentChunk ? "\n\n" : "") + next;
    } else {
      if (currentChunk.length >= MIN_CHUNK_SIZE) {
        chunks.push(currentChunk);
      }

      if (next.length > MAX_CHUNK_SIZE) {
        const sentences = next.match(/[^.!?]+[.!?]+/g) || [next];
        let sentenceChunk = "";

        for (const sentence of sentences) {
          if ((sentenceChunk + sentence).length < MAX_CHUNK_SIZE) {
            sentenceChunk += sentence;
          } else {
            chunks.push(sentenceChunk);
            sentenceChunk = sentence;
          }
        }

        if (sentenceChunk.length >= MIN_CHUNK_SIZE) {
          chunks.push(sentenceChunk);
        }
      } else {
        currentChunk = next;
      }
    }
  }

  if (currentChunk.length >= MIN_CHUNK_SIZE) {
    chunks.push(currentChunk);
  }

  return chunks;
}
