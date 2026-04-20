"use server";

import { createServiceClient } from "@/lib/supabase";
import { logEngagement } from "@/lib/engagement";

interface PortfolioLeadResult {
  success: boolean;
  error?: string;
}

/**
 * Server action backing /for-chains. Writes the lead row, fires an
 * engagement event, and sends an immediate notification email to
 * partners@comfyseniors.com via Resend. Best-effort email — DB write
 * succeeds even if Resend is down, so we never lose a lead.
 */
export async function submitPortfolioLead(
  formData: FormData
): Promise<PortfolioLeadResult> {
  const chainName = (formData.get("chain_name") as string)?.trim();
  const totalFacilitiesRaw = formData.get("total_facilities_count") as string;
  const primaryState = (formData.get("primary_state") as string)?.trim();
  const contactName = (formData.get("contact_name") as string)?.trim();
  const contactEmail = (formData.get("contact_email") as string)?.trim();
  const contactPhone = (formData.get("contact_phone") as string)?.trim();

  const totalFacilities = parseInt(totalFacilitiesRaw, 10);

  if (!chainName || !primaryState || !contactName || !contactEmail || !contactPhone) {
    return { success: false, error: "All fields are required." };
  }
  if (!Number.isFinite(totalFacilities) || totalFacilities < 25) {
    return {
      success: false,
      error: "Portfolio deals start at 25 facilities. For smaller operators, see /for-facilities.",
    };
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contactEmail)) {
    return { success: false, error: "Please enter a valid email address." };
  }
  if (primaryState.length !== 2) {
    return { success: false, error: "State must be a 2-letter code (e.g. NJ)." };
  }

  // Service role bypasses RLS — required because this server action
  // needs the inserted lead.id back for the Resend email body. Anon
  // INSERT policies pass but the RETURNING row trips the (absent)
  // anon SELECT policy and the whole transaction rolls back.
  const supabase = createServiceClient();

  // Insert lead — the row is the source of truth, email is just an alert
  const { data: lead, error: insertError } = await supabase
    .from("portfolio_leads")
    .insert({
      chain_name: chainName,
      total_facilities_count: totalFacilities,
      primary_state: primaryState.toUpperCase(),
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
    })
    .select()
    .single();

  if (insertError) {
    return { success: false, error: "Could not save lead. Please try again." };
  }

  // Engagement event (best-effort)
  await logEngagement({
    event_type: "chain_form_submit",
    metadata: {
      lead_id: lead.id,
      chain_name: chainName,
      total_facilities: totalFacilities,
      primary_state: primaryState.toUpperCase(),
    },
  });

  // Send notification email (best-effort — lead already saved above)
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail =
    process.env.RESEND_FROM_EMAIL || "partners@comfyseniors.com";

  if (resendKey) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);

      const body = `New portfolio lead — ${chainName}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Chain:          ${chainName}
Facility count: ${totalFacilities}
Primary state:  ${primaryState.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Contact:        ${contactName}
Email:          ${contactEmail}
Phone:          ${contactPhone}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Lead ID: ${lead.id}
View in admin: https://www.comfyseniors.com/staff
Submitted via /for-chains

Next step: reply within 1 business day to beat the 24-hour SLA promise made on the form.
`;

      await resend.emails.send({
        from: `ComfySeniors <${fromEmail}>`,
        to: "partners@comfyseniors.com",
        replyTo: contactEmail,
        subject: `[Portfolio Lead] ${chainName} — ${totalFacilities} facilities`,
        text: body,
      });
    } catch {
      // Swallow — we don't want to fail the form submission because
      // Resend had a blip. Lead is in DB, admin can pull it from /staff.
    }
  }

  return { success: true };
}
