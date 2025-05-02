
/**
 * PURPOSE:
 * This function combines multiple structured AI analysis results from chunked legal documents.
 * It calculates an overall score, merges arrays (e.g., risks, recommendations), deduplicates entries,
 * and includes any raw content or error logs if chunk parsing failed.
 */

type AnalysisChunk = {
  overallScore: number;
  criticalPoints: any[];
  financialRisks: any[];
  unusualLanguage: any[];
  recommendations: any[];
  content?: string;
  error?: boolean;
  message?: string;
  chunkIndex?: number;
};

type CombinedResult = {
  overallScore: number;
  criticalPoints: any[];
  financialRisks: any[];
  unusualLanguage: any[];
  recommendations: any[];
  content?: string;
  errors?: { chunkIndex: number; message: string }[];
  generatedText?: string;
};

export function combineResults(results: AnalysisChunk[]): CombinedResult {
  const combined: CombinedResult = {
    overallScore: 0,
    criticalPoints: [],
    financialRisks: [],
    unusualLanguage: [],
    recommendations: [],
    errors: [],
    content: ""
  };

  let totalScore = 0;
  let validChunks = 0;
  let hasRawContent = false;

  results.forEach((chunk, index) => {
    if (chunk.error) {
      combined.errors?.push({
        chunkIndex: chunk.chunkIndex ?? index,
        message: chunk.message || "Unknown error"
      });
      if (chunk.content) {
        combined.content += `\n\n--- Chunk ${index + 1} (raw output) ---\n\n${chunk.content}`;
        hasRawContent = true;
      }
      return;
    }

    totalScore += chunk.overallScore || 0;
    validChunks++;

    // Merge arrays
    combined.criticalPoints.push(...(chunk.criticalPoints || []));
    combined.financialRisks.push(...(chunk.financialRisks || []));
    combined.unusualLanguage.push(...(chunk.unusualLanguage || []));
    combined.recommendations.push(...(chunk.recommendations || []));

    if (chunk.content) {
      combined.content += `\n\n--- Chunk ${index + 1} ---\n\n${chunk.content}`;
      hasRawContent = true;
    }
  });

  // Compute average score
  if (validChunks > 0) {
    combined.overallScore = Math.round(totalScore / validChunks);
  }

  // Deduplicate by key field
  combined.criticalPoints = deduplicate(combined.criticalPoints, "title");
  combined.financialRisks = deduplicate(combined.financialRisks, "title");
  combined.unusualLanguage = deduplicate(combined.unusualLanguage, "text");
  combined.recommendations = deduplicate(combined.recommendations, "text");

  // Include fallback text if no structured data was found
  if (
    hasRawContent &&
    combined.criticalPoints.length === 0 &&
    combined.financialRisks.length === 0 &&
    combined.unusualLanguage.length === 0 &&
    combined.recommendations.length === 0
  ) {
    combined.generatedText = combined.content;
  }

  return combined;
}

/**
 * Remove duplicate objects in an array based on a property value
 */
function deduplicate(array: any[], key: string): any[] {
  const seen = new Set();
  return array.filter((item) => {
    if (!item || typeof item !== "object") return false;
    const val = item[key];
    if (seen.has(val)) return false;
    seen.add(val);
    return true;
  });
}
