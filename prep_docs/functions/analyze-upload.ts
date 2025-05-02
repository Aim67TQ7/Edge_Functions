/**
 * PURPOSE:
 * This Deno HTTP function accepts an uploaded document (PDF, TXT, CSV, DOCX, etc.),
 * detects its type, extracts its content using specialized parsers,
 * chunks the content, sends it to Claude for legal analysis,
 * and returns a structured summary for legal review.
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import * as base64 from "https://deno.land/std@0.177.0/encoding/base64.ts";
import { detectMimeType } from "../utils/detect-mime.ts";
import { orchestrateFileAnalysis } from "../orchestrator/orchestrate-file-analysis.ts";
import { formatForLawyer } from "../utils/format-for-lawyer.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const contentType = req.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      throw new Error("Only application/json is supported. Please send base64-encoded file and metadata.");
    }

    const { content, fileName, mimeType } = await req.json();

    if (!content || !fileName) {
      throw new Error("Missing required fields: content, fileName");
    }

    const buffer = content.startsWith("data:")
      ? base64.decode(content.split(",")[1])
      : base64.decode(content);

    const resolvedMime = mimeType || detectMimeType(fileName);

    console.log(`Analyzing ${fileName} as ${resolvedMime}...`);

    const analysis = await orchestrateFileAnalysis({
      fileBuffer: buffer,
      fileName,
      mimeType: resolvedMime
    });

    const formatted = formatForLawyer(analysis, fileName);

    return new Response(JSON.stringify({
      summary: formatted,
      analysis
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });

  } catch (error) {
    console.error("Error in /analyze-upload:", error);
    return new Response(JSON.stringify({
      error: true,
      message: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
