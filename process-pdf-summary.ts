/**
 * PURPOSE:
 * This Deno serverless function processes an uploaded PDF file, extracts text from it using PDF.js,
 * and sends that text to OpenAI's GPT-4o-mini model for summarization. The output is a concise summary
 * of the PDF content returned as JSON. The function also supports CORS and handles errors gracefully.
 * 
 * KEY STEPS:
 * - Accepts a multipart/form-data POST request with a PDF file
 * - Uses PDF.js to extract readable text from each page
 * - Truncates and sends that text to OpenAI's GPT API
 * - Returns a summarized version of the content
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import * as pdfjs from "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js";

// Load OpenAI API key from environment
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// CORS configuration for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

/**
 * Extracts all text from a PDF file buffer using PDF.js
 */
async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(' ');
    fullText += pageText + '\n';
  }
  return fullText;
}

// Start HTTP server
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Ensure OpenAI API key exists
    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      throw new Error('OpenAI API key not configured');
    }

    // Parse uploaded file from form data
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      console.error('No file uploaded or invalid file');
      throw new Error('No file uploaded');
    }

    console.log('Processing file:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Convert uploaded file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Extract text from the PDF
    const pdfText = await extractTextFromPDF(arrayBuffer);
    const trimmedText = pdfText.trim();

    if (!trimmedText) {
      throw new Error('No text content found in PDF');
    }

    console.log('Extracted text length:', trimmedText.length);

    // Send extracted text to OpenAI for summarization
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that summarizes PDF documents. Create a concise summary of the following text:'
          },
          {
            role: 'user',
            content: trimmedText.substring(0, 4000) // Prevent token overflow
          }
        ]
      })
    });

    // Check OpenAI API response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    // Parse and return the summary
    const data = await response.json();
    console.log('Successfully generated summary');

    return new Response(JSON.stringify({
      summary: data.choices[0].message.content
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error in process-pdf function:', error);
    return new Response(JSON.stringify({
      error: error.message,
      details: error instanceof Error ? error.stack : undefined
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
