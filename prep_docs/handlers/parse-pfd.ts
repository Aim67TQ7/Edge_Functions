/**
 * PURPOSE:
 * This function uses PDF.js to extract readable text from a binary PDF buffer.
 * It returns a full raw text string extracted from all pages.
 */

import * as pdfjsLib from "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js";

export async function parsePdf(buffer: Uint8Array): Promise<string> {
  try {
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items.map((item: any) => item.str).join(" ");
      fullText += text + "\n\n";
    }

    return fullText.trim();
  } catch (error) {
    console.error("Failed to parse PDF:", error);
    throw new Error("PDF parsing failed");
  }
}
