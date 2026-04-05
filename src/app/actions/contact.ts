"use server";

import { createClient } from "@/lib/supabase";

interface ContactResult {
  success: boolean;
  error?: string;
}

/**
 * Server action: sends a facility inquiry via Resend email relay.
 * Inserts a lead record for analytics. NEVER stores family PII.
 */
export async function sendFacilityInquiry(
  formData: FormData
): Promise<ContactResult> {
  const facilityId = formData.get("facilityId") as string;
  const inquiryType = formData.get("inquiryType") as string;
  const message = formData.get("message") as string;

  // Validate
  if (!facilityId || !inquiryType || !message?.trim()) {
    return { success: false, error: "All fields are required." };
  }

  if (message.length > 2000) {
    return { success: false, error: "Message is too long (max 2000 characters)." };
  }

  try {
    const supabase = createClient();

    // Look up facility email for Resend relay
    const { data: facility } = await supabase
      .from("facilities")
      .select("email, name")
      .eq("id", facilityId)
      .single();

    // Send email via Resend if configured
    const resendKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "hello@comfyseniors.com";

    if (resendKey && facility?.email) {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);

      const subjectMap: Record<string, string> = {
        tour_request: "Tour Request",
        pricing_question: "Pricing Question",
        general_inquiry: "General Inquiry",
      };

      await resend.emails.send({
        from: `ComfySeniors <${fromEmail}>`,
        to: facility.email,
        subject: `${subjectMap[inquiryType] || "Inquiry"} via ComfySeniors`,
        text: `New inquiry for ${facility.name}:\n\nType: ${subjectMap[inquiryType] || inquiryType}\n\nMessage:\n${message}\n\n---\nSent via ComfySeniors.com\nThis message was submitted anonymously. No contact information was collected.`,
      });
    }

    // Insert lead for analytics — NO PII stored
    await supabase.from("leads").insert({
      facility_id: facilityId,
      inquiry_type: inquiryType,
      message: message.trim(),
    });

    return { success: true };
  } catch {
    return { success: false, error: "Failed to send inquiry. Please try again." };
  }
}
