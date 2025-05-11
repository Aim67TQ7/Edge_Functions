/**
 * PURPOSE:
 * This function performs AI-powered visual inspections of a property using OpenAI GPT-4o Vision.
 * It analyzes each image provided via `imageUrls` and returns condition scores and improvement suggestions
 * for roof, gutters, siding, and landscaping based on visual content.
 */ import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    const { imageUrls, propertyInfo } = await req.json();
    if (!imageUrls || !Array.isArray(imageUrls) || !propertyInfo) {
      return new Response(JSON.stringify({
        error: "imageUrls[] and propertyInfo are required"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }
    // Timestamp for report
    const timestamp = new Date().toISOString();
    const overallFindings = [];
    for (const { url, viewTag } of imageUrls){
      console.log(`Analyzing image: ${url} (${viewTag})`);
      // Prompt for visual property inspection
      const prompt = `You are a property inspector analyzing exterior house photos.
Evaluate and grade the following:
- Roof condition (materials, damage, wear)
- Gutter condition (damage, clogging)
- Siding condition (paint, cracks, aging)
- Landscaping quality (trees, grass, bushes)

Format response as:
{
  "roof": { "score": 0-10, "repairNeeded": true/false, "notes": "..." },
  "gutters": { "score": 0-10, "repairNeeded": true/false, "notes": "..." },
  "siding": { "score": 0-10, "repairNeeded": true/false, "notes": "..." },
  "landscaping": { "score": 0-10, "repairNeeded": true/false, "notes": "..." }
}`;
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a property inspection consultant."
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: prompt
                },
                {
                  type: "image_url",
                  image_url: {
                    url
                  }
                }
              ]
            }
          ],
          response_format: {
            type: "json_object"
          },
          max_tokens: 1000
        })
      });
      const gptData = await response.json();
      // Try to parse the AI response
      try {
        const parsed = JSON.parse(gptData.choices[0].message.content);
        overallFindings.push({
          url,
          viewTag,
          analysis: parsed
        });
      } catch (parseError) {
        console.error("Failed to parse GPT response:", gptData);
        overallFindings.push({
          url,
          viewTag,
          error: "Failed to parse AI response",
          raw: gptData.choices?.[0]?.message?.content
        });
      }
    }
    const report = {
      timestamp,
      propertySummary: {
        address: propertyInfo?.address || "N/A",
        imagesAnalyzed: imageUrls.length,
        overallFindings
      }
    };
    return new Response(JSON.stringify(report), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error in analyze-property function:", error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
