import type { Metadata } from "next";
import Link from "next/link";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import CareTypeBadge from "@/components/ui/CareTypeBadge";
import CitationBadge from "@/components/ui/CitationBadge";
import ValueScore from "@/components/facility/ValueScore";
import { getFacilitiesBySlugs } from "@/lib/queries";
import type { Facility } from "@/types";

export const metadata: Metadata = {
  title: "Compare Senior Care Facilities — ComfySeniors",
  description:
    "Side-by-side comparison of up to 3 New Jersey senior care facilities. See prices, inspection records, and key details at a glance.",
};

interface ComparePageProps {
  searchParams: { facilities?: string | string[] };
}

function formatCurrency(amount: number | null): string {
  if (!amount) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const slugsParam = searchParams.facilities;
  const slugs = Array.isArray(slugsParam)
    ? slugsParam
    : slugsParam
      ? slugsParam.split(",")
      : [];

  let facilities: Facility[] = [];
  try {
    facilities = await getFacilitiesBySlugs(slugs.slice(0, 3));
  } catch {
    // Empty
  }

  // Sort to match order of slugs
  facilities.sort(
    (a, b) => slugs.indexOf(a.slug) - slugs.indexOf(b.slug)
  );

  if (facilities.length === 0) {
    return (
      <PageWrapper>
        <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h1 className="font-display text-hero-mobile text-cs-blue-dark md:text-hero">
            Compare facilities
          </h1>
          <p className="mt-4 text-cs-muted">
            Select up to 3 facilities to compare side by side. Start by
            browsing the directory.
          </p>
          <div className="mt-8">
            <Button href="/search" size="lg">
              Browse facilities
            </Button>
          </div>
        </section>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-6">
          <p className="label text-cs-lavender">Side-by-side comparison</p>
          <h1 className="mt-2 font-display text-hero-mobile text-cs-blue-dark md:text-hero">
            Comparing {facilities.length}{" "}
            {facilities.length === 1 ? "facility" : "facilities"}
          </h1>
        </div>

        <div className="overflow-x-auto rounded-card border border-cs-border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cs-border bg-cs-lavender-mist">
                <th className="sticky left-0 bg-cs-lavender-mist p-4 text-left font-semibold text-cs-blue-dark">
                  Feature
                </th>
                {facilities.map((f) => (
                  <th
                    key={f.id}
                    className="min-w-[220px] p-4 text-left font-semibold"
                  >
                    <Link
                      href={`/facility/${f.slug}`}
                      className="text-cs-blue-dark hover:text-cs-blue"
                    >
                      {f.name}
                    </Link>
                    <p className="mt-1 text-xs font-normal text-cs-muted">
                      {f.city}, {f.zip}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <ComparisonRow
                label="Care types"
                values={facilities.map((f) => (
                  <div key={f.id} className="flex flex-wrap gap-1">
                    {f.care_types?.map((t) => (
                      <CareTypeBadge key={t} type={t} />
                    ))}
                  </div>
                ))}
              />
              <ComparisonRow
                label="Value score"
                values={facilities.map((f) => (
                  <ValueScore key={f.id} score={f.value_score} size="sm" />
                ))}
              />
              <ComparisonRow
                label="Monthly price"
                values={facilities.map((f) => (
                  <span
                    key={f.id}
                    className="font-semibold text-cs-blue"
                  >
                    {f.price_min && f.price_max
                      ? `${formatCurrency(f.price_min)} – ${formatCurrency(f.price_max)}`
                      : formatCurrency(f.price_min)}
                  </span>
                ))}
              />
              <ComparisonRow
                label="Citations (last 12mo)"
                values={facilities.map((f) => (
                  <CitationBadge
                    key={f.id}
                    count={f.citation_count ?? 0}
                  />
                ))}
              />
              <ComparisonRow
                label="Overall rating"
                values={facilities.map((f) => (
                  <span key={f.id}>
                    {f.overall_rating
                      ? "★".repeat(f.overall_rating) +
                        "☆".repeat(5 - f.overall_rating)
                      : "—"}
                  </span>
                ))}
              />
              <ComparisonRow
                label="RN turnover"
                values={facilities.map((f) => (
                  <span key={f.id}>
                    {f.rn_turnover ? `${f.rn_turnover.toFixed(1)}%` : "—"}
                  </span>
                ))}
              />
              <ComparisonRow
                label="Beds"
                values={facilities.map((f) => (
                  <span key={f.id}>{f.beds ?? "—"}</span>
                ))}
              />
              <ComparisonRow
                label="Medicaid"
                values={facilities.map((f) => (
                  <span key={f.id} className={f.accepts_medicaid ? "text-cs-green-ok" : "text-cs-muted"}>
                    {f.accepts_medicaid ? "Accepted" : "Not accepted"}
                  </span>
                ))}
              />
              <ComparisonRow
                label="Medicare"
                values={facilities.map((f) => (
                  <span key={f.id} className={f.accepts_medicare ? "text-cs-green-ok" : "text-cs-muted"}>
                    {f.accepts_medicare ? "Accepted" : "Not accepted"}
                  </span>
                ))}
              />
              <ComparisonRow
                label="Phone"
                values={facilities.map((f) => (
                  <a
                    key={f.id}
                    href={`tel:${f.phone}`}
                    className="text-cs-blue hover:underline"
                  >
                    {f.phone ?? "—"}
                  </a>
                ))}
              />
              <ComparisonRow
                label="Website"
                values={facilities.map((f) =>
                  f.website ? (
                    <a
                      key={f.id}
                      href={f.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cs-blue hover:underline"
                    >
                      Visit site →
                    </a>
                  ) : (
                    <span key={f.id} className="text-cs-muted">—</span>
                  )
                )}
              />
              <tr>
                <td className="sticky left-0 bg-white p-4" />
                {facilities.map((f) => (
                  <td key={f.id} className="p-4">
                    <Button
                      href={`/facility/${f.slug}`}
                      variant="ghost"
                      size="sm"
                    >
                      View full profile
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 text-center">
          <Button href="/search" variant="ghost">
            Back to search
          </Button>
        </div>
      </section>
    </PageWrapper>
  );
}

function ComparisonRow({
  label,
  values,
}: {
  label: string;
  values: React.ReactNode[];
}) {
  return (
    <tr className="border-b border-cs-border">
      <td className="sticky left-0 bg-white p-4 font-medium text-cs-blue-dark">
        {label}
      </td>
      {values.map((v, i) => (
        <td key={i} className="p-4 align-top text-cs-body">
          {v}
        </td>
      ))}
    </tr>
  );
}
