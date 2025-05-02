/**
 * PURPOSE:
 * Extract text from images (JPG, PNG, TIFF) using Claude Vision or external OCR engine.
 */

export async function parseImageOCR(base64Image: string): Promise<string> {
  // TODO: Replace with Claude Vision OCR or Tesseract integration
  return `Image received (base64 length: ${base64Image.length}). OCR not implemented yet.`;
}
