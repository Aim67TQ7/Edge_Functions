/**
 * PURPOSE:
 * This function parses a `.json` file buffer and summarizes it as readable key-value sections.
 * If the file is deeply nested, it flattens and formats key paths.
 */

export async function parseJson(buffer: Uint8Array): Promise<string> {
  try {
    const text = new TextDecoder().decode(buffer);
    const data = JSON.parse(text);

    const flat = flattenObject(data);
    return Object.entries(flat)
      .map(([key, val]) => `${key}: ${val}`)
      .join("\n");
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    throw new Error("Invalid JSON file format.");
  }
}

// Helper to flatten deeply nested JSON
function flattenObject(obj: any, parentKey = '', result: Record<string, any> = {}): Record<string, any> {
  for (const [key, val] of Object.entries(obj)) {
    const newKey = parentKey ? `${parentKey}.${key}` : key;
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      flattenObject(val, newKey, result);
    } else {
      result[newKey] = Array.isArray(val) ? val.join(', ') : val;
    }
  }
  return result;
}
