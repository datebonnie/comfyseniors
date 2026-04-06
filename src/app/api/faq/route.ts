import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase";

/**
 * FAQ AI Answer Engine
 * 1. Parses the question for location, care type, and intent
 * 2. Queries Supabase for relevant facility data
 * 3. Sends data + question to Claude for a grounded answer
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "AI answers are not configured. Please add your ANTHROPIC_API_KEY to environment variables." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  const { question } = await req.json();

  if (!question || typeof question !== "string" || question.trim().length < 3) {
    return new Response(
      JSON.stringify({ error: "Please enter a question." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const q = question.trim().toLowerCase();

  // ─── Query Supabase for relevant data ───
  let dataContext = "";

  try {
    const supabase = createClient();

    // Extract potential city/location from question
    const cityMatch = q.match(
      /\b(?:in|near|around|at)\s+([a-z\s]+?)(?:\s*,|\s+nj|\s+new jersey|\?|$)/i
    );
    const zipMatch = q.match(/\b(0[789]\d{3})\b/);

    // Extract care type mentions
    const careTypeKeywords: Record<string, string> = {
      "assisted living": "Assisted Living",
      "memory care": "Memory Care",
      "nursing home": "Nursing Home",
      "nursing homes": "Nursing Home",
      "skilled nursing": "Nursing Home",
      "independent living": "Independent Living",
      "home care": "Home Care",
      "home health": "Home Care",
    };

    let mentionedCareType: string | null = null;
    for (const [keyword, careType] of Object.entries(careTypeKeywords)) {
      if (q.includes(keyword)) {
        mentionedCareType = careType;
        break;
      }
    }

    // Build targeted queries based on what the question is about
    const isAboutCost = /cost|price|pricing|afford|expensive|cheap|how much|pay|budget|average/.test(q);
    const isAboutCount = /how many|count|number of|total|facilities in/.test(q);
    const isAboutMedicaid = /medicaid/.test(q);
    const isAboutMedicare = /medicare/.test(q);
    const isAboutInspection = /inspection|citation|violation|safety|record|clean/.test(q);
    const isAboutSpecific = cityMatch || zipMatch;

    if (isAboutSpecific || isAboutCount || isAboutCost) {
      // Query facilities matching location/type
      let query = supabase
        .from("facilities")
        .select("name, city, zip, county, care_types, price_min, price_max, citation_count, accepts_medicaid, accepts_medicare, beds")
        .limit(500);

      if (zipMatch) {
        query = query.eq("zip", zipMatch[1]);
      } else if (cityMatch) {
        const city = cityMatch[1].trim();
        query = query.ilike("city", `%${city}%`);
      }

      if (mentionedCareType) {
        query = query.contains("care_types", [mentionedCareType]);
      }

      if (isAboutMedicaid) {
        query = query.eq("accepts_medicaid", true);
      }

      if (isAboutMedicare) {
        query = query.eq("accepts_medicare", true);
      }

      const { data: facilities } = await query;

      if (facilities && facilities.length > 0) {
        const total = facilities.length;
        const withPrices = facilities.filter((f) => f.price_min);
        const avgMin = withPrices.length > 0
          ? Math.round(withPrices.reduce((s, f) => s + (f.price_min || 0), 0) / withPrices.length)
          : null;
        const avgMax = withPrices.length > 0
          ? Math.round(withPrices.reduce((s, f) => s + (f.price_max || 0), 0) / withPrices.length)
          : null;
        const cleanRecord = facilities.filter((f) => f.citation_count === 0).length;
        const acceptsMedicaid = facilities.filter((f) => f.accepts_medicaid).length;
        const acceptsMedicare = facilities.filter((f) => f.accepts_medicare).length;
        const acceptsPrivate = facilities.length; // all accept private
        const cities = Array.from(new Set(facilities.map((f) => f.city).filter(Boolean)));
        const careTypes = Array.from(new Set(facilities.flatMap((f) => f.care_types || [])));

        dataContext = `\n\nRELEVANT DATA FROM OUR DATABASE (use this to answer):
- Total matching facilities: ${total}
- Care types represented: ${careTypes.join(", ")}
- Cities: ${cities.slice(0, 15).join(", ")}${cities.length > 15 ? ` and ${cities.length - 15} more` : ""}
${avgMin ? `- Average price range: $${avgMin.toLocaleString()} – $${avgMax?.toLocaleString()}/month` : ""}
${withPrices.length > 0 ? `- Price range across all: $${Math.min(...withPrices.map((f) => f.price_min!)).toLocaleString()} – $${Math.max(...withPrices.map((f) => f.price_max || f.price_min!)).toLocaleString()}/month` : ""}
- Clean inspection record: ${cleanRecord} of ${total} (${Math.round((cleanRecord / total) * 100)}%)
- Accept Medicaid: ${acceptsMedicaid} of ${total}
- Accept Medicare: ${acceptsMedicare} of ${total}
- Accept private pay: ${acceptsPrivate} of ${total}

Sample facilities (first 10):
${facilities.slice(0, 10).map((f) => `  - ${f.name} (${f.city}, ${f.zip}) — ${(f.care_types || []).join(", ")} — $${f.price_min?.toLocaleString() || "?"}-$${f.price_max?.toLocaleString() || "?"}/mo — ${f.citation_count} citations — Medicaid: ${f.accepts_medicaid ? "Yes" : "No"}`).join("\n")}`;
      } else {
        dataContext = "\n\nNOTE: No facilities matched the specific location/filters in the question. Answer based on general NJ knowledge.";
      }
    }

    // For general stats questions without a specific location
    if (!isAboutSpecific && (isAboutCount || isAboutCost)) {
      // Get overall stats
      let totalQuery = supabase.from("facilities").select("id", { count: "exact", head: true });
      if (mentionedCareType) {
        totalQuery = totalQuery.contains("care_types", [mentionedCareType]);
      }
      const { count } = await totalQuery;

      if (count) {
        dataContext += `\n\nOVERALL DATABASE STATS:
- Total ${mentionedCareType || "senior care"} facilities in NJ: ${count}`;
      }
    }

    // For inspection questions
    if (isAboutInspection && !dataContext) {
      const { data: inspectionData } = await supabase
        .from("facilities")
        .select("citation_count")
        .limit(1000);

      if (inspectionData) {
        const total = inspectionData.length;
        const clean = inspectionData.filter((f) => f.citation_count === 0).length;
        const avg = Math.round(inspectionData.reduce((s, f) => s + f.citation_count, 0) / total * 10) / 10;
        dataContext = `\n\nINSPECTION DATA FROM OUR DATABASE:
- Total facilities tracked: ${total}
- Clean record (0 citations): ${clean} (${Math.round((clean / total) * 100)}%)
- Average citations per facility: ${avg}`;
      }
    }
  } catch {
    // If Supabase query fails, continue without data context
    dataContext = "";
  }

  // ─── Stream response from Claude ───
  const anthropic = new Anthropic({ apiKey });

  try {
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6-20250514",
      max_tokens: 800,
      system: `You are the AI assistant for ComfySeniors.com, New Jersey's most honest senior care directory. You have access to real data from our database of 1,000+ licensed NJ facilities.

Rules:
- Answer in plain English. Define any healthcare term you use.
- Be specific to New Jersey where relevant.
- When you have database data, USE IT — cite specific numbers, counts, and prices from the data provided.
- If asked about a specific city or zip code, reference the actual facilities and stats from our database.
- If asked "how many," give the exact count from the data.
- If asked about costs, give the actual price ranges from our data.
- Never make up facility names or data. Only reference what's in the provided data.
- If no data was provided or the data doesn't answer the question, say so honestly and give general NJ guidance.
- Keep answers under 250 words.
- End with a helpful next step when appropriate (e.g., "You can search for these on ComfySeniors.com" or "Use our Care Match Quiz to find your best options").
- Never pressure families. No urgency tactics.`,
      messages: [
        {
          role: "user",
          content: question.trim() + dataContext,
        },
      ],
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ text: event.delta.text })}\n\n`
                )
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          const message = err instanceof Error ? err.message : "Stream interrupted.";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: message })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate answer.";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
