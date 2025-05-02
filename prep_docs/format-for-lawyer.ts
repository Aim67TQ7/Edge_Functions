/**
 * PURPOSE:
 * This function formats structured legal analysis into a clear narrative summary for legal teams or human review.
 * It transforms arrays like risks, clauses, and recommendations into bulleted sections with headings.
 */

type CombinedResult = {
  overallScore: number;
  criticalPoints: any[];
  financialRisks: any[];
  unusualLanguage: any[];
  recommendations: any[];
  generatedText?: string;
  content?: string;
};

export function formatForLawyer(result: CombinedResult, fileName?: string): string {
  let output = "";

  output += `📝 Legal Document Analysis Report`;
  if (fileName) output += `: *${fileName}*`;
  output += `\n\n---\n\n`;

  output += `📊 **Overall Score**: ${result.overallScore}/100\n\n`;

  if (result.criticalPoints.length > 0) {
    output += `⚠️ **Critical Legal Points**:\n`;
    result.criticalPoints.forEach((item, i) => {
      output += `- ${item.title || item.text || item}\n`;
    });
    output += `\n`;
  }

  if (result.financialRisks.length > 0) {
    output += `💸 **Financial Risks**:\n`;
    result.financialRisks.forEach((item, i) => {
      output += `- ${item.title || item.text || item}\n`;
    });
    output += `\n`;
  }

  if (result.unusualLanguage.length > 0) {
    output += `🧩 **Unusual or Non-standard Language**:\n`;
    result.unusualLanguage.forEach((item, i) => {
      output += `- ${item.title || item.text || item}\n`;
    });
    output += `\n`;
  }

  if (result.recommendations.length > 0) {
    output += `📌 **Recommendations**:\n`;
    result.recommendations.forEach((item, i) => {
      output += `- ${item.text || item}\n`;
    });
    output += `\n`;
  }

  // If no structured output, show fallback
  if (
    result.criticalPoints.length === 0 &&
    result.financialRisks.length === 0 &&
    result.unusualLanguage.length === 0 &&
    result.recommendations.length === 0
  ) {
    output += `⚠️ No structured findings were extracted.\n`;
    output += `\n🧾 Raw analysis output:\n\n`;
    output += result.generatedText || result.content || "(no content available)";
  }

  return output.trim();
}
