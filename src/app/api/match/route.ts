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

  // ─── Progressive search: start strict, broaden until results ───
  const supabase = createClient();
  const selectFields =
    "id, name, slug, care_types, city, county, zip, price_min, price_max, beds, citation_count, accepts_medicaid, accepts_medicare, description, amenities, languages";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let facilities: any[] | null = null;

  // Attempt 1: Exact zip + care type
  if (zipCode && inferredCareType) {
    const { data } = await supabase
      .from("facilities")
      .select(selectFields)
      .eq("zip", zipCode)
      .contains("care_types", [inferredCareType])
      .limit(30);
    if (data && data.length > 0) facilities = data;
  }

  // Attempt 2: Exact zip, any care type
  if (!facilities && zipCode) {
    const { data } = await supabase
      .from("facilities")
      .select(selectFields)
      .eq("zip", zipCode)
      .limit(30);
    if (data && data.length > 0) facilities = data;
  }

  // Attempt 3: Zip prefix (e.g. 076xx) + care type
  if (!facilities && zipCode && inferredCareType) {
    const prefix = zipCode.slice(0, 3);
    const { data } = await supabase
      .from("facilities")
      .select(selectFields)
      .ilike("zip", `${prefix}%`)
      .contains("care_types", [inferredCareType])
      .limit(30);
    if (data && data.length > 0) facilities = data;
  }

  // Attempt 4: Zip prefix, any care type
  if (!facilities && zipCode) {
    const prefix = zipCode.slice(0, 3);
    const { data } = await supabase
      .from("facilities")
      .select(selectFields)
      .ilike("zip", `${prefix}%`)
      .limit(30);
    if (data && data.length > 0) facilities = data;
  }

  // Attempt 5: Just care type, statewide
  if (!facilities && inferredCareType) {
    const { data } = await supabase
      .from("facilities")
      .select(selectFields)
      .contains("care_types", [inferredCareType])
      .limit(30);
    if (data && data.length > 0) facilities = data;
  }

  // Attempt 6: No filters at all — just get some facilities
  if (!facilities) {
    const { data } = await supabase
      .from("facilities")
      .select(selectFields)
      .order("is_featured", { ascending: false })
      .limit(20);
    facilities = data;
  }

  if (!facilities || facilities.length === 0) {
    return NextResponse.json({
      matches: [],
      message: "We couldn't find any facilities. Please try again.",
    });
  }

  // ─── Call Claude API with all 10 answers ───
  const anthropic = new Anthropic({ apiKey });

  const prompt = `You are a senior care matching assistant for ComfySeniors.com,
Bergen County, NJ's assisted living and memory care directory.

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

Here are the available facilities in their area (JSON):
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
