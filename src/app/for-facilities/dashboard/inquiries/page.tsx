import { getUserFacility, createAuthClient } from "@/lib/auth";
import { redirect } from "next/navigation";
import MarkConversionButton from "./MarkConversionButton";

interface LeadRow {
  id: string;
  code: string | null;
  inquiry_type: string | null;
  message: string | null;
  converted_at: string | null;
  conversion_notes: string | null;
  created_at: string;
}

export default async function InquiriesPage() {
  const facility = await getUserFacility();
  if (!facility) redirect("/for-facilities/dashboard");

  const supabase = createAuthClient();

  const { data: leads } = await supabase
    .from("leads")
    .select("id, code, inquiry_type, message, converted_at, conversion_notes, created_at")
    .eq("facility_id", facility.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const inquiries = (leads as LeadRow[]) ?? [];

  const typeLabels: Record<string, string> = {
    tour_request: "Tour Request",
    pricing_question: "Pricing Question",
    general_inquiry: "General Inquiry",
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-cs-blue-dark">Inquiries</h1>
        <p className="mt-1 text-sm text-cs-muted">
          Track referral codes from ComfySeniors. Mark a code as converted when
          a referred family becomes a resident.
        </p>
      </div>

      {inquiries.length === 0 ? (
        <div className="rounded-card border border-cs-border bg-white p-10 text-center">
          <p className="text-lg font-semibold text-cs-blue-dark">
            No inquiries yet
          </p>
          <p className="mt-2 text-sm text-cs-muted">
            When families contact you through ComfySeniors, their referral codes
            will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className={`rounded-card border bg-white p-5 ${
                inquiry.converted_at
                  ? "border-cs-green-ok/30"
                  : "border-cs-border"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  {/* Code */}
                  <div className="flex items-center gap-3">
                    {inquiry.code && (
                      <span className="font-mono text-lg font-semibold tracking-wider text-cs-blue-dark">
                        {inquiry.code}
                      </span>
                    )}
                    {inquiry.converted_at ? (
                      <span className="rounded-full bg-cs-green-ok/10 px-2.5 py-0.5 text-[11px] font-semibold text-cs-green-ok">
                        Converted
                      </span>
                    ) : (
                      <span className="rounded-full bg-cs-blue-light px-2.5 py-0.5 text-[11px] font-semibold text-cs-blue">
                        Pending
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <p className="mt-2 text-sm text-cs-muted">
                    {typeLabels[inquiry.inquiry_type ?? ""] ??
                      inquiry.inquiry_type ??
                      "Inquiry"}{" "}
                    &middot;{" "}
                    {new Date(inquiry.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>

                  {inquiry.message && (
                    <p className="mt-2 max-w-lg text-sm text-cs-body">
                      {inquiry.message.length > 200
                        ? inquiry.message.slice(0, 200) + "..."
                        : inquiry.message}
                    </p>
                  )}

                  {inquiry.converted_at && (
                    <p className="mt-2 text-xs text-cs-green-ok">
                      Converted on{" "}
                      {new Date(inquiry.converted_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                      {inquiry.conversion_notes &&
                        ` — ${inquiry.conversion_notes}`}
                    </p>
                  )}
                </div>

                {/* Mark conversion button */}
                {!inquiry.converted_at && inquiry.code && (
                  <MarkConversionButton code={inquiry.code} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
