"use server";

import { createClient } from "@/lib/supabase";

interface ReferralResult {
  success: boolean;
  error?: string;
  code?: string;
  shareUrl?: string;
}

/**
 * Generate a unique facility referral code.
 * Format: REF-XXXXX (5 chars, no confusable characters)
 */
function generateReferralCode(): string {
  const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  let code = "REF-";
  for (let i = 0; i < 5; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

/**
 * Create a referral link for a verified facility.
 * The referrer shares this link with other facilities.
 */
export async function createFacilityReferral(
  facilityId: string,
  referredEmail?: string
): Promise<ReferralResult> {
  if (!facilityId) {
    return { success: false, error: "Facility ID required." };
  }

  const supabase = createClient();

  // Verify the facility exists and is verified
  const { data: facility } = await supabase
    .from("facilities")
    .select("id, is_verified, is_featured")
    .eq("id", facilityId)
    .single();

  if (!facility) {
    return { success: false, error: "Facility not found." };
  }

  if (!facility.is_verified && !facility.is_featured) {
    return { success: false, error: "Only Verified members can refer other facilities." };
  }

  // Generate unique code (retry on collision)
  let code = generateReferralCode();
  for (let attempt = 0; attempt < 3; attempt++) {
    const { error } = await supabase.from("facility_referrals").insert({
      referrer_id: facilityId,
      referral_code: code,
      referred_email: referredEmail || null,
    });

    if (!error) {
      const shareUrl = `https://comfyseniors.com/for-facilities?ref=${code}`;
      return { success: true, code, shareUrl };
    }

    if (error.code === "23505") {
      code = generateReferralCode();
      continue;
    }

    return { success: false, error: "Failed to create referral." };
  }

  return { success: false, error: "Failed to generate unique code." };
}

/**
 * Get all referrals for a facility.
 */
export async function getFacilityReferrals(facilityId: string) {
  const supabase = createClient();

  const { data } = await supabase
    .from("facility_referrals")
    .select("*")
    .eq("referrer_id", facilityId)
    .order("created_at", { ascending: false });

  return data ?? [];
}
