
/**
 * PURPOSE:
 * This function parses a CSV file buffer into a readable text block.
 * It returns text content structured as row-wise summaries for embedding or analysis.
 */

export async function parseCsv(buffer: Uint8Array): Promise<string> {
  const csv = new TextDecoder().decode(buffer);
  const lines = csv.trim().split("\n");
  const headers = lines[0].split(",");

  const rows = lines.slice(1).map((line, i) => {
    const values = line.split(",");
    const pairs = headers.map((h, j) => `${h.trim()}: ${values[j]?.trim() || ""}`);
    return `Row ${i + 1}:\n` + pairs.join("\n");
  });

  return rows.join("\n\n");
}
