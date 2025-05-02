/**
 * PURPOSE:
 * This function reads a plain text (.txt) file buffer and converts it into a UTF-8 string.
 * It returns the full text, ready for chunking and analysis.
 */

export async function parseText(buffer: Uint8Array): Promise<string> {
  try {
    const text = new TextDecoder("utf-8").decode(buffer);
    return text.trim();
  } catch (error) {
    console.error("TXT parse error:", error);
    throw new Error("Failed to parse .txt file");
  }
}
