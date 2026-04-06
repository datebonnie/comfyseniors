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
  const {
    relationship,
    age,
    dailyChallenge,
    medications,
    dementia,
    urgency,
    zipCode,
    budget,
    insurance,
    priority,
  } = body;

  // ─── Infer care type from answers ───
  let inferredCareType: string | null = null;

  if (dementia === "moderate" || dementia === "advanced") {
    inferredCareType = "Memory Care";
  } else if (dailyChallenge === "medical needs" || medications === "complex") {
    inferredCareType = "Nursing Home";
  } else if (dailyChallenge === "staying home") {
    inferredCareType = "Home Care";
  } else if (dailyChallenge === "mostly independent") {
    inferredCareType = "Independent Living";
  } else if (
    dailyChallenge === "daily activities" ||
    dailyChallenge === "mobility" ||
    dementia === "early stage"
  ) {
    inferredCareType = "Assisted Living";
  }

  // ─── Build Supabase query ───
  const supabase = createClient();
  let query = supabase
    .from("facilities")
    .select(
      "id, name, slug, care_types, city, county, zip, price_min, price_max, beds, citation_count, accepts_medicaid, accepts_medicare, description, amenities, languages"
    )
    .limit(30);

  // Filter by inferred care type
  if (inferredCareType) {
    query = query.contains("care_types", [inferredCareType]);
  }

  // Filter by zip code
  if (zipCode) {
    query = query.eq("zip", zipCode);
  }

  // Filter by budget
  if (budget && budget !== "not sure") {
    const budgetMap: Record<string, number> = {
      "under $3K": 3000,
      "$3-5K": 5000,
      "$5-8K": 8000,
      "$8-12K": 12000,
      "over $12K": 20000,
    };
    const max = budgetMap[budget];
    if (max && budget !== "over $12K") {
      query = query.lte("price_min", max);
    }
  }

  // Filter by insurance
  if (insurance === "Medicaid") {
    query = query.eq("accepts_medicaid", true);
  } else if (insurance === "Medicare") {
    query = query.eq("accepts_medicare", true);
  }

  // Filter by clean record if that's the priority
  if (priority === "clean record") {
    query = query.eq("citation_count", 0);
  }

  let { data: facilities } = await query;

  // If zip code gave no results, broaden to city or county
  if ((!facilities || facilities.length === 0) && zipCode) {
    // Try to find facilities in nearby zip codes (first 3 digits match)
    const zipPrefix = zipCode.slice(0, 3);
    let broadQuery = supabase
      .from("facilities")
      .select(
        "id, name, slug, care_types, city, county, zip, price_min, price_max, beds, citation_count, accepts_medicaid, accepts_medicare, description, amenities, languages"
      )
      .ilike("zip", `${zipPrefix}%`)
      .limit(30);

    if (inferredCareType) {
      broadQuery = broadQuery.contains("care_types", [inferredCareType]);
    }

    const { data: broadResults } = await broadQuery;
    facilities = broadResults;
  }

  // If still no results, drop all filters except care type
  if (!facilities || facilities.length === 0) {
    let fallbackQuery = supabase
      .from("facilities")
      .select(
        "id, name, slug, care_types, city, county, zip, price_min, price_max, beds, citation_count, accepts_medicaid, accepts_medicare, description, amenities, languages"
      )
      .limit(20);

    if (inferredCareType) {
      fallbackQuery = fallbackQuery.contains("care_types", [inferredCareType]);
    }

    const { data: fallbackResults } = await fallbackQuery;
    facilities = fallbackResults;
  }

  if (!facilities || facilities.length === 0) {
    return NextResponse.json({
      matches: [],
      message:
        "We couldn't find facilities matching your criteria. Try broadening your search.",
    });
  }

  // ─── Call Claude API with all 10 answers ───
  const anthropic = new Anthropic({ apiKey });

  const prompt = `You are a senior care matching assistant for ComfySeniors.com,
a New Jersey senior care directory.

A family completed our 10-question care assessment:

1. Who needs care: ${relationship}
2. Age of person needing care: ${age}
3. Biggest daily challenge: ${dailyChallenge}
4. Medication needs: ${medications}
5. Alzheimer's/dementia diagnosis: ${dementia}
6. How soon care is needed: ${urgency}
7. Zip code: ${zipCode || "not specified"}
8. Monthly budget: ${budget}
9. Payment method: ${insurance}
10. Top priority: ${priority}

Based on these answers, we inferred they need: ${inferredCareType || "general senior care"}

Here are the matching facilities in their area (JSON):
${JSON.stringify(facilities, null, 2)}

Analyze the family's specific situation and rank the top 3-5 best-fitting facilities. Consider:
- Care type alignment with their daily challenges and medical needs
- Dementia/memory care capabilities if relevant
- Budget compatibility
- Medication management level needed
- Insurance acceptance
- Citation/safety record if safety is their priority
- Proximity to their zip code

Return a JSON array with:
- facility_id
- match_reason (1 specific sentence explaining why THIS facility fits THEIR situation — reference their actual answers)
- priority_rank (1 = best match)

Return JSON only. No preamble.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const text = textBlock && "text" in textBlock ? textBlock.text : "[]";

    let matches;
    try {
      const jsonStr = text
        .replace(/```json?\n?/g, "")
        .replace(/```/g, "")
        .trim();
      matches = JSON.parse(jsonStr);
    } catch {
      matches = [];
    }

    const enriched = Array.isArray(matches)
      ? matches
          .map(
            (m: {
              facility_id: string;
              match_reason: string;
              priority_rank: number;
            }) => {
              const facility = facilities!.find((f) => f.id === m.facility_id);
              if (!facility) return null;
              return { ...m, facility };
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
