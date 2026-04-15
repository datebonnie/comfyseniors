"use client";

import { useState } from "react";
import type { Facility, Review } from "@/types";
import PriceDisplay from "@/components/ui/PriceDisplay";
import ReviewsList from "./ReviewsList";

interface FacilityTabsProps {
  facility: Facility;
  reviews: Review[];
}

const tabs = ["Overview", "Reviews", "Pricing", "Inspection", "Location"] as const;
type Tab = (typeof tabs)[number];

export default function FacilityTabs({
  facility,
  reviews,
}: FacilityTabsProps) {
  const [active, setActive] = useState<Tab>("Overview");

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-0 overflow-x-auto border-b border-cs-border">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              active === tab
                ? "border-cs-blue text-cs-blue"
                : "border-transparent text-cs-muted hover:text-cs-blue-dark"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="py-6">
        {active === "Overview" && <OverviewTab facility={facility} />}
        {active === "Reviews" && <ReviewsList reviews={reviews} />}
        {active === "Pricing" && <PricingTab facility={facility} />}
        {active === "Inspection" && <InspectionTab facility={facility} />}
        {active === "Location" && <LocationTab facility={facility} />}
      </div>
    </div>
  );
}

/* ─── Tab panels ────────────────────────────── */

function OverviewTab({ facility }: { facility: Facility }) {
  return (
    <div className="space-y-6">
      {facility.description && (
        <div>
          <h4 className="mb-2 font-semibold text-cs-blue-dark">About</h4>
          <p className="text-sm leading-relaxed text-cs-body">
            {facility.description}
          </p>
        </div>
      )}

      {facility.amenities && facility.amenities.length > 0 && (
        <div>
          <h4 className="mb-2 font-semibold text-cs-blue-dark">Amenities</h4>
          <div className="flex flex-wrap gap-2">
            {facility.amenities.map((a) => (
              <span
                key={a}
                className="rounded-full border border-cs-border bg-cs-lavender-mist px-3 py-1 text-sm text-cs-body"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {facility.languages && facility.languages.length > 0 && (
        <div>
          <h4 className="mb-2 font-semibold text-cs-blue-dark">Languages spoken</h4>
          <p className="text-sm text-cs-body">
            {facility.languages.join(", ")}
          </p>
        </div>
      )}

      {facility.beds && (
        <div>
          <h4 className="mb-2 font-semibold text-cs-blue-dark">Capacity</h4>
          <p className="text-sm text-cs-body">{facility.beds} beds</p>
        </div>
      )}
    </div>
  );
}

function PricingTab({ facility }: { facility: Facility }) {
  return (
    <div className="space-y-6">
      <PriceDisplay
        priceMin={facility.price_min}
        priceMax={facility.price_max}
        variant="full"
      />

      <div>
        <h4 className="mb-2 font-semibold text-cs-blue-dark">Accepted payment methods</h4>
        <div className="flex flex-wrap gap-2">
          {facility.accepts_private && (
            <span className="rounded-full border border-cs-border bg-cs-lavender-mist px-3 py-1 text-sm text-cs-body">
              Private pay
            </span>
          )}
          {facility.accepts_medicare && (
            <span className="rounded-full border border-cs-blue-light bg-cs-blue-light px-3 py-1 text-sm text-cs-blue-dark">
              Medicare
            </span>
          )}
          {facility.accepts_medicaid && (
            <span className="rounded-full border border-cs-blue-light bg-cs-blue-light px-3 py-1 text-sm text-cs-blue-dark">
              Medicaid
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function InspectionTab({ facility }: { facility: Facility }) {
  const date = facility.last_inspection
    ? new Date(facility.last_inspection).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not available";

  return (
    <div className="space-y-4">
      <div>
        <h4 className="mb-1 font-semibold text-cs-blue-dark">Last inspection</h4>
        <p className="text-sm text-cs-body">{date}</p>
      </div>

      <div>
        <h4 className="mb-1 font-semibold text-cs-blue-dark">
          Citations in last 12 months
        </h4>
        <p className="text-sm text-cs-body">{facility.citation_count}</p>
      </div>

      {facility.inspection_summary && (
        <div>
          <h4 className="mb-1 font-semibold text-cs-blue-dark">Summary</h4>
          <p className="text-sm leading-relaxed text-cs-body">
            {facility.inspection_summary}
          </p>
        </div>
      )}

      {facility.license_number && (
        <div>
          <h4 className="mb-1 font-semibold text-cs-blue-dark">License number</h4>
          <p className="text-sm text-cs-body">{facility.license_number}</p>
        </div>
      )}

      {facility.inspection_url && (
        <a
          href={facility.inspection_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-cs-blue transition-colors hover:text-cs-blue-dark"
        >
          View full state inspection report
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        </a>
      )}
    </div>
  );
}

function LocationTab({ facility }: { facility: Facility }) {
  const fullAddress = [facility.address, facility.city, facility.state, facility.zip]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-4">
      {fullAddress && (
        <div>
          <h4 className="mb-1 font-semibold text-cs-blue-dark">Address</h4>
          <p className="text-sm text-cs-body">{fullAddress}</p>
        </div>
      )}

      <div className="flex h-64 items-center justify-center rounded-lg border border-cs-border bg-cs-lavender-mist">
        <p className="text-sm text-cs-muted">Map integration coming soon</p>
      </div>
    </div>
  );
}
