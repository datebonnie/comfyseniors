/**
 * Welcome email sent from the Stripe webhook on successful checkout.
 * Runs server-side (Resend API), fires once per completed session.
 *
 * The from-address is the transactional one (partners@comfyseniors.com)
 * per the outreach/transactional split — cold campaigns still go from
 * hello@, but "thank you for paying us" belongs to the transactional
 * sender.
 */

interface SendWelcomeArgs {
  to: string;
  facilityName: string;
  planTag: "verified" | "claim" | "medicaid" | "founding";
  /** One-click magic link that lands the admin in the dashboard. */
  magicLinkUrl: string;
}

const PLAN_COPY: Record<
  SendWelcomeArgs["planTag"],
  { header: string; price: string; next: string }
> = {
  founding: {
    header: "Welcome, Founding Member.",
    price: "$197/month, locked in for life",
    next: "Your Founding Partner badge is now live on your public page. Log in below to finish your profile — photos, description, and citation responses take about 15 minutes.",
  },
  verified: {
    header: "Welcome to ComfySeniors Verified.",
    price: "$297/month",
    next: "Your Verified badge is live. The 'Not Verified' warning is gone. Log in below to finish your profile — photos, description, and citation responses take about 15 minutes.",
  },
  claim: {
    header: "Welcome. Your listing is claimed.",
    price: "$97/month",
    next: "Your Verified badge is live and the 'Not Verified' warning is gone. Log in below to add your description and respond to any reviews.",
  },
  medicaid: {
    header: "Welcome to the Medicare/Medicaid Listing.",
    price: "$397/month",
    next: "Your listing now ranks with priority placement when families filter for facilities accepting Medicare or Medicaid. Log in below to finish your profile.",
  },
};

export async function sendWelcomeEmail(args: SendWelcomeArgs): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.warn("[welcome-email] RESEND_API_KEY missing; skipping send");
    return;
  }

  const fromEmail =
    process.env.RESEND_FROM_EMAIL || "partners@comfyseniors.com";
  const copy = PLAN_COPY[args.planTag];

  const subject = `${args.facilityName} is now verified on ComfySeniors`;

  const body = `Hi,

${copy.header}

${args.facilityName} is now a paid listing on ComfySeniors.com (${copy.price}).

${copy.next}

Log in to your dashboard:
${args.magicLinkUrl}

The link above signs you in instantly. No password to create, no account to register — the link IS the login. If it expires before you click it, go to https://www.comfyseniors.com/for-facilities/login and request a new one.

Three things worth doing first:

  1. Upload 3+ photos of your community. Stock-feel photos kill conversion more than no photos.
  2. Write 2-3 paragraphs about what makes your facility different. Families compare, and specific beats generic every time.
  3. If you have any open state citations, post a public response. Families see the citation AND your context — which is rare in this industry and worth a lot to them.

Once those three are done, your page converts at roughly 3x the rate of an unfinished profile.

Questions, feedback, or something misrepresented on your page? Reply to this email — it comes straight to my inbox.

— Brandoll Montero, Founder
  ComfySeniors LLC
  https://www.comfyseniors.com/trust
`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `ComfySeniors <${fromEmail}>`,
        to: args.to,
        reply_to: "bmontero@comfyseniors.com",
        subject,
        text: body,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`[welcome-email] send failed: ${res.status} ${text}`);
    }
  } catch (err) {
    console.error("[welcome-email] exception:", err);
  }
}
