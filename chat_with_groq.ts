/**
 * PURPOSE:
 * This Deno function acts as a proxy for sending chat-based messages to Groq's Mixtral model.
 * It:
 * - Accepts a POST request with `messages[]`
 * - Ensures a system prompt exists
 * - Sends the message chain to Groq's `/v1/chat/completions` endpoint
 * - Returns the assistant's message or a fallback response
 *
 * This function includes:
 * - CORS handling
 * - Error safety
 * - Graceful fallback if Groq returns 202 (Accepted but not processed yet)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// API configuration
const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "mixtral-8x7b-32768";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse and validate JSON
    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid messages format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (!GROQ_API_KEY) {
      return new Response(JSON.stringify({ error: "GROQ API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Ensure system message is present
    const formattedMessages = [...messages];
    if (!formattedMessages.some((msg) => msg.role === "system")) {
      formattedMessages.unshift({
        role: "system",
        content: "You are a helpful AI assistant that provides clear and concise answers."
      });
    }

    // Request payload
    const payload = {
      model: MODEL,
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 2048
    };

    console.log("Sending request to Groq...");
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    // Handle delayed responses (202 Accepted)
    if (response.status === 202) {
      console.warn("Groq API returned 202 Accepted — still processing.");
      return new Response(JSON.stringify({
        status: "processing",
        message: "Request accepted but not completed. Please retry shortly."
      }), {
        status: 202,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Handle error responses
    if (!response.ok) {
      const error = await response.text();
      console.error("Groq API error:", error);
      return new Response(JSON.stringify({ error: `Groq Error: ${response.statusText}` }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Parse and return chat completion
    const completion = await response.json();
    const message = completion.choices?.[0]?.message?.content?.trim() || "No response generated.";

    return new Response(JSON.stringify({ message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error in chat completion function:", error);
    return new Response(JSON.stringify({
      error: `Server error: ${error.message}`
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
