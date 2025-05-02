/**
 * PURPOSE:
 * Extract visible content from raw HTML.
 */

export async function parseHtml(buffer: Uint8Array): Promise<string> {
  const raw = new TextDecoder().decode(buffer);
  const stripped = raw.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
                      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
                      .replace(/<\/?[^>]+>/g, "")
                      .replace(/\s+/g, " ");
  return stripped.trim();
}
