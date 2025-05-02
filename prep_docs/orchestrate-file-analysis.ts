
/**
 * PURPOSE:
 * This orchestrator accepts a file (base64 or binary), detects its type,
 * routes it to the appropriate parser (.ts module), and runs chunk-based AI analysis.
 */

import { detectMimeType } from "./utils/detect-mime.ts";
import { parsePdf } from "./handlers/parse-pdf.ts";
import { parseCsv } from "./handlers/parse-csv.ts";
import { parseText } from "./handlers/parse-txt.ts";
import { parseDocx } from "./handlers/parse-docx.ts";
import { chunkText } from "./utils/chunk-text.ts";
import { analyzeChunk } from "./utils/analyze-chunk.ts";
import { combineResults } from "./utils/combine-results.ts";

export async function orchestrateFileAnalysis({
  fileBuffer,
  fileName,
  mimeType
}: {
  fileBuffer: Uint8Array;
  fileName: string;
  mimeType?: string;
}) {
  try {
    const type = mimeType || detectMimeType(fileName);
    let rawText = "";

    switch (type) {
      case "application/pdf":
        rawText = await parsePdf(fileBuffer);
        break;
      case "text/csv":
        rawText = await parseCsv(fileBuffer);
        break;
      case "text/plain":
        rawText = await parseText(fileBuffer);
        break;
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        rawText = await parseDocx(fileBuffer);
        break;
      default:
        throw new Error(`Unsupported file type: ${type}`);
    }

    const chunks = chunkText(rawText);
    const results = [];

    for (const [index, chunk] of chunks.entries()) {
      const result = await analyzeChunk(chunk, index, chunks.length);
      results.push(result);
    }

    return combineResults(results);
  } catch (error) {
    console.error("Orchestration failed:", error);
    return {
      error: true,
      message: error.message,
      recommendations: [
        { text: "Unable to analyze this file. Please check format or try a different document." }
      ]
    };
  }
}
