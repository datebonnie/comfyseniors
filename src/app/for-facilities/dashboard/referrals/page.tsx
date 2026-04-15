import { getUserFacility, createAuthClient } from "@/lib/auth";
import { redirect } from "next/navigation";
import ReferralActions from "./ReferralActions";

export default async function ReferralsPage() {
  const facility = await getUserFacility();
  if (!facility) redirect("/for-facilities/dashboard");

  const isVerified = facility.is_verified || facility.is_featured;

  // Get existing referrals
  const supabase = createAuthClient();
  const { data: referrals } = await supabase
    .from("facility_referrals")
    .select("*")
    .eq("referrer_id", facility.id)
    .order("created_at", { ascending: false });

  const allReferrals = referrals ?? [];
  const subscribedCount = allReferrals.filter((r) => r.status === "subscribed" || r.status === "credited").length;
  const totalCredits = subscribedCount * 297;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-cs-blue-dark">
          Referral Program
        </h1>
        <p className="mt-1 text-sm text-cs-muted">
          Refer other facilities to ComfySeniors. When they subscribe, you get
          one month free ($297 credit).
        </p>
      </div>

      {!isVerified ? (
        <div className="max-w-xl rounded-card border border-cs-amber-warn/30 bg-[#FEF3C7] p-6">
          <p className="font-semibold text-[#92400E]">
            Verified members only
          </p>
          <p className="mt-2 text-sm text-[#92400E]">
            The referral program is available to Verified members. Upgrade to
            start earning $297 credits for every facility you refer.
          </p>
          <a
            href="/for-facilities/dashboard/billing"
            className="mt-4 inline-block rounded-btn bg-cs-blue px-5 py-2 text-sm font-semibold text-white hover:bg-cs-blue-dark"
          >
            Get Verified
          </a>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-card border border-cs-border bg-white p-5">
              <p className="label text-cs-lavender">Referrals sent</p>
              <p className="mt-2 font-display text-3xl text-cs-blue-dark">
                {allReferrals.length}
              </p>
            </div>
            <div className="rounded-card border border-cs-border bg-white p-5">
              <p className="label text-cs-lavender">Converted</p>
              <p className="mt-2 font-display text-3xl text-cs-green-ok">
                {subscribedCount}
              </p>
            </div>
            <div className="rounded-card border border-cs-border bg-white p-5">
              <p className="label text-cs-lavender">Credits earned</p>
              <p className="mt-2 font-display text-3xl text-cs-blue">
                ${totalCredits}
              </p>
            </div>
          </div>

          {/* Generate referral */}
          <div className="mb-8 max-w-xl rounded-card border-2 border-cs-blue bg-cs-blue-light p-6">
            <h2 className="mb-2 font-semibold text-cs-blue-dark">
              Refer a facility
            </h2>
            <p className="mb-4 text-sm text-cs-body">
              Generate a referral link to share with another facility. When they
              subscribe to Verified, you get a $297 credit on your next bill.
              They get their first month at 50% off.
            </p>
            <ReferralActions facilityId={facility.id} />
          </div>

          {/* Referral history */}
          {allReferrals.length > 0 && (
            <div>
              <h2 className="mb-4 font-semibold text-cs-blue-dark">
                Referral history
              </h2>
              <div className="space-y-3">
                {allReferrals.map((ref) => (
                  <div
                    key={ref.id}
                    className={`rounded-card border bg-white p-4 ${
                      ref.status === "subscribed" || ref.status === "credited"
                        ? "border-cs-green-ok/30"
                        : "border-cs-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono text-sm font-semibold tracking-wider text-cs-blue-dark">
                          {ref.referral_code}
                        </span>
                        {ref.referred_email && (
                          <span className="ml-3 text-xs text-cs-muted">
                            Sent to: {ref.referred_email}
                          </span>
                        )}
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          ref.status === "subscribed" || ref.status === "credited"
                            ? "bg-cs-green-ok/10 text-cs-green-ok"
                            : ref.status === "signed_up"
                              ? "bg-cs-blue-light text-cs-blue"
                              : "bg-cs-lavender-mist text-cs-muted"
                        }`}
                      >
                        {ref.status === "credited"
                          ? "Credit applied"
                          : ref.status === "subscribed"
                            ? "Subscribed — $297 credit earned"
                            : ref.status === "signed_up"
                              ? "Signed up"
                              : "Pending"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-cs-muted">
                      Created{" "}
                      {new Date(ref.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* How it works */}
          <div className="mt-8 rounded-card border border-cs-border bg-white p-6">
            <h2 className="mb-4 font-semibold text-cs-blue-dark">
              How the referral program works
            </h2>
            <div className="space-y-3">
              {[
                "Generate a unique referral link above",
                "Share it with another facility — email, text, or in person",
                "When they subscribe to Verified ($297/mo), you get a $297 credit",
                "They get their first month at 50% off ($149)",
                "No limit on referrals — refer 10 facilities, get 10 months free",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-cs-body">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cs-blue text-[10px] font-semibold text-white">
                    {i + 1}
                  </span>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
