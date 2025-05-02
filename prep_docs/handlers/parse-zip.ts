/**
 * PURPOSE:
 * Extract and summarize all files inside a ZIP archive (up to a depth or file limit).
 */

import * as unzip from "https://deno.land/x/zipjs@v1.0.0/mod.ts";

export async function parseZip(buffer: Uint8Array): Promise<string> {
  const zip = await unzip.unzipRaw(buffer);
  const summaries: string[] = [];

  for (const path in zip) {
    const entry = zip[path];
    if (path.endsWith(".txt") || path.endsWith(".csv") || path.endsWith(".md")) {
      const content = await entry.text();
      summaries.push(`--- ${path} ---\n${content.slice(0, 2000)}\n`);
    }
  }

  return summaries.join("\n");
}
