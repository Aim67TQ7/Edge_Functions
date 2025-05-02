/**
 * PURPOSE:
 * This function sends a single chunk of legal text to an LLM (Claude or GPT)
 * and expects a structured legal analysis response.
 */

import Anthropic from "npm:@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY") || ""
});

const MODEL = "claude-3-haiku-20240307";

export async function analyzeChunk(text: string, index: number, total: number): Promise<any> {
  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4000,
      temperature: 0.2,
      system: `You are an experienced legal analyst for a harvard attorney. Provide structured legal analysis of this contract text (chunk ${index + 1} of ${total}).`,
      messages: [
        {
          role: "user",
          content: `Analyze the following legal text for:
1. Critical legal points
2. Financial risks
3. Unusual language
4. Actionable recommendations

Respond in this JSON format:
{
  "overallScore": number,
  "criticalPoints": [...],
  "financialRisks": [...],
  "unusualLanguage": [...],
  "recommendations": [...]
}

Text:
${text}`
        }
      ]
    });

    const rawText = response.content?.[0]?.text || "{}";
    return JSON.parse(rawText);
  } catch (error) {
    console.error("Error analyzing chunk:", error);
    return {
      error: true,
      message: error.message,
      chunkIndex: index,
      overallScore: 0
    };
  }
}

