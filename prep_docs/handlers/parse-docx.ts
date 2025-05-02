
/**
 * PURPOSE:
 * This function extracts plain text from a .docx Word document.
 * It returns the body content of the file, ready for chunking and AI analysis.
 */

import * as unzip from "https://deno.land/x/zipjs@v1.0.0/mod.ts";

export async function parseDocx(buffer: Uint8Array): Promise<string> {
  try {
    const zip = await unzip.unzipRaw(buffer);
    const xmlContent = await zip["word/document.xml"]?.text();

    if (!xmlContent) {
      throw new Error("DOCX content not found");
    }

    const text = xmlContent
      .replace(/<w:t[^>]*>/g, "")
      .replace(/<\/w:t>/g, "")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();

    return text;
  } catch (error) {
    console.error("DOCX parse error:", error);
    throw new Error("Failed to parse DOCX file");
  }
}
