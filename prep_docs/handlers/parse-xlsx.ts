/**
 * PURPOSE:
 * Converts Excel spreadsheets to text summaries (one row per paragraph).
 */

import * as XLSX from "https://esm.sh/xlsx";

export async function parseXlsx(buffer: Uint8Array): Promise<string> {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];

  const output = rows.map((row, i) => `Row ${i + 1}: ${row.join(" | ")}`).join("\n\n");
  return output.trim();
}
