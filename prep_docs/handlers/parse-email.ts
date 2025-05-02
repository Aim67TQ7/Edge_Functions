/**
 * PURPOSE:
 * This function extracts text from raw `.eml` (or `.msg` as plain text) email files.
 * It returns the visible body and metadata like subject, sender, and date.
 */

export async function parseEmail(buffer: Uint8Array): Promise<string> {
  try {
    const text = new TextDecoder().decode(buffer);

    // Extract basic headers
    const subject = text.match(/^Subject: (.+)$/m)?.[1] || "No subject";
    const from = text.match(/^From: (.+)$/m)?.[1] || "Unknown sender";
    const date = text.match(/^Date: (.+)$/m)?.[1] || "No date";
    const bodyStart = text.indexOf("\n\n");

    const body = bodyStart >= 0 ? text.slice(bodyStart + 2).trim() : text;

    return `📩 Email Summary\n\nFrom: ${from}\nDate: ${date}\nSubject: ${subject}\n\n--- Body ---\n${body}`;
  } catch (error) {
    console.error("Failed to parse email:", error);
    throw new Error("Unable to parse .eml or .msg file.");
  }
}
