import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI matching is not configured." },
      { status: 503 }
    );
  }

  const body = await req.json();
  const { relationship, careType, location, radius, budget, insurance } = body;

  // Build Supabase query for matching facilities
  const supabase = createClient();
  let query = supabase
    .from("facilities")
    .select(
      "id, name, slug, care_types, city, county, price_min, price_max, citation_count, accepts_medicaid, accepts_medicare, description"
    )
    .limit(20);

  // Filter by care type if specified
  if (careType && careType !== "not sure") {
    const typeMap: Record<string, string> = {
      "assisted living": "Assisted Living",
      "memory care": "Memory Care",
      independent: "Independent Living",
      "nursing home": "Nursing Home",
      "home care": "Home Care",
    };
    const mapped = typeMap[careType];
    if (mapped) {
      query = query.contains("care_types", [mapped]);
    }
  }

  // Filter by location (city match)
  if (location) {
    query = query.ilike("city", `%${location}%`);
  }

  // Filter by budget
  if (budget && budget !== "not sure") {
    const budgetMap: Record<string, number> = {
      "under $3K": 3000,
      "$3-5K": 5000,
      "$5-8K": 8000,
      "over $8K": 15000,
    };
    const max = budgetMap[budget];
    if (max && budget !== "over $8K") {
      query = query.lte("price_min", max);
    }
  }

  // Filter by insurance
  if (insurance === "Medicaid") {
    query = query.eq("accepts_medicaid", true);
  } else if (insurance === "Medicare") {
    query = query.eq("accepts_medicare", true);
  }

  const { data: facilities } = await query;

  if (!facilities || facilities.length === 0) {
    return NextResponse.json({
      matches: [],
      message:
        "We couldn't find facilities matching your criteria. Try broadening your search.",
    });
  }

  // Call Claude API
  const anthropic = new Anthropic({ apiKey });

  const prompt = `You are a senior care matching assistant for ComfySeniors.com,
a New Jersey senior care directory.

A family answered:
- Relationship: ${relationship}
- Care type: ${careType}
- Location: ${location || "any"}, within ${radius || 25} miles
- Budget: ${budget}
- Insurance: ${insurance}

Matching facilities (JSON):
${JSON.stringify(facilities, null, 2)}

Return a JSON array of top 3–5 matches with:
- facility_id
- match_reason (1 plain-English sentence)
- priority_rank (1–5)

Return JSON only. No preamble.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    // Extract text content
    const textBlock = response.content.find((b) => b.type === "text");
    const text = textBlock && "text" in textBlock ? textBlock.text : "[]";

    // Parse JSON from response (handle markdown code blocks)
    let matches;
    try {
      const jsonStr = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      matches = JSON.parse(jsonStr);
    } catch {
      matches = [];
    }

    // Enrich matches with facility data
    const enriched = Array.isArray(matches)
      ? matches
          .map(
            (m: {
              facility_id: string;
              match_reason: string;
              priority_rank: number;
            }) => {
              const facility = facilities.find((f) => f.id === m.facility_id);
              if (!facility) return null;
              return {
                ...m,
                facility,
              };
            }
          )
          .filter(Boolean)
          .sort(
            (
              a: { priority_rank: number } | null,
              b: { priority_rank: number } | null
            ) => (a?.priority_rank ?? 99) - (b?.priority_rank ?? 99)
          )
      : [];

    return NextResponse.json({ matches: enriched });
  } catch {
    return NextResponse.json(
      { error: "AI matching failed. Please try again." },
      { status: 500 }
    );
  }
}
