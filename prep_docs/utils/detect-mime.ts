/**
 * PURPOSE:
 * This utility function determines the MIME type of a file based on its extension.
 * It is used when the actual `Content-Type` header is unavailable or unreliable.
 */

export function detectMimeType(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";

  switch (extension) {
    case "pdf":
      return "application/pdf";
    case "csv":
      return "text/csv";
    case "txt":
      return "text/plain";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "doc":
      return "application/msword";
    case "json":
      return "application/json";
    default:
      return "application/octet-stream"; // Fallback: binary blob
  }
}
