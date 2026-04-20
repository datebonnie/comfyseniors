"use server";

import { createServiceClient } from "@/lib/supabase";

interface ContactResult {
  success: boolean;
  error?: string;
  code?: string;
}

/**
 * Generate a unique referral code like "CS-7K4J9".
 * Format: CS-{5 random alphanumeric chars, excluding confusable ones}
 */
function generateCode(): string {
  // Exclude: 0, O, 1, I, L for readability
  const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  let code = "CS-";
  for (let i = 0; i < 5; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

/**
 * Server action: sends a facility inquiry via Resend email relay.
 * Generates a tokenized referral code that enables referral tracking
 * without storing family PII.
 */
export async function sendFacilityInquiry(
  formData: FormData
): Promise<ContactResult> {
  const facilityId = formData.get("facilityId") as string;
  const inquiryType = formData.get("inquiryType") as string;
  const message = formData.get("message") as string;

  if (!facilityId || !inquiryType || !message?.trim()) {
    return { success: false, error: "All fields are required." };
  }

  if (message.length > 2000) {
    return { success: false, error: "Message is too long (max 2000 characters)." };
  }

  // Generate unique referral code (retry if collision)
  let code = generateCode();

  try {
    // Service role: writes to leads (insert + RETURNING) require
    // privileged access under our RLS policy set, and this path is
    // a server action so the key stays on the server.
    const supabase = createServiceClient();

    // Look up facility for Resend relay
    const { data: facility } = await supabase
      .from("facilities")
      .select("email, name, is_verified, is_featured")
      .eq("id", facilityId)
      .single();

    // Insert lead with unique code (retry on conflict up to 3 times)
    let insertResult = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data, error } = await supabase
        .from("leads")
        .insert({
          facility_id: facilityId,
          inquiry_type: inquiryType,
          message: message.trim(),
          code,
        })
        .select()
        .single();

      if (!error) {
        insertResult = data;
        break;
      }

      // If unique constraint violation, regenerate and retry
      if (error.code === "23505") {
        code = generateCode();
        continue;
      }

      throw error;
    }

    if (!insertResult) {
      return { success: false, error: "Failed to generate referral code. Please try again." };
    }

    // Send Resend email if configured
    const resendKey = process.env.RESEND_API_KEY;
    // Inquiry forwarding is transactional — use the transactional
    // FROM (partners@), not the outreach FROM (hello@).
    const fromEmail =
      process.env.RESEND_FROM_EMAIL || "partners@comfyseniors.com";

    if (resendKey && facility?.email) {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);

      const subjectMap: Record<string, string> = {
        tour_request: "Tour Request",
        pricing_question: "Pricing Question",
        general_inquiry: "General Inquiry",
      };

      const isVerifiedMember = facility.is_verified || facility.is_featured;

      const billingNote = isVerifiedMember
        ? `As a Verified member, no placement fee applies. This lead is yours free.`
        : `This inquiry came through ComfySeniors.com. If this family becomes
a resident, a one-time placement fee (one month's rent) applies.
Mark this referral code as converted in your dashboard within 30 days.
Upgrade to Verified ($297/mo) to eliminate placement fees entirely.`;

      const emailBody = `New inquiry for ${facility.name}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REFERRAL CODE: ${code}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${billingNote}

Type: ${subjectMap[inquiryType] || inquiryType}

Message:
${message.trim()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This message was submitted anonymously.
No family contact information was collected or transmitted.
Sent via ComfySeniors.com
`;

      await resend.emails.send({
        from: `ComfySeniors <${fromEmail}>`,
        to: facility.email,
        subject: `[${code}] ${subjectMap[inquiryType] || "Inquiry"} via ComfySeniors`,
        text: emailBody,
      });
    }

    return { success: true, code };
  } catch {
    return { success: false, error: "Failed to send inquiry. Please try again." };
  }
}

/**
 * Facility-side action: mark an inquiry as converted to a move-in.
 * This triggers placement fee billing.
 */
export async function markInquiryConverted(
  code: string,
  notes?: string
): Promise<ContactResult> {
  if (!code || !/^CS-[A-Z0-9]{5}$/i.test(code)) {
    return { success: false, error: "Invalid referral code format." };
  }

  try {
    // Service role: UPDATE with RETURNING on the leads table needs
    // to bypass RLS; facility admins don't control this path, we do.
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("leads")
      .update({
        converted_at: new Date().toISOString(),
        conversion_notes: notes || null,
      })
      .eq("code", code.toUpperCase())
      .is("converted_at", null)
      .select()
      .single();

    if (error || !data) {
      return {
        success: false,
        error: "Code not found or already marked as converted.",
      };
    }

    return { success: true, code };
  } catch {
    return { success: false, error: "Failed to mark conversion." };
  }
}
