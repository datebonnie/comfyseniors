import type { Facility } from "@/types";

/**
 * Shared profile-completeness computation used by:
 *   - the dashboard OnboardingChecklist widget (facing the admin)
 *   - the daily nag cron (picks up incomplete profiles to email)
 *
 * Each step below represents a real field on the facilities row OR a
 * real related-entity count (citations responded to, etc.). Nothing is
 * fabricated — if the check passes, the underlying data is genuinely
 * complete.
 */

export interface OnboardingStep {
  key:
    | "photos"
    | "description"
    | "amenities"
    | "pricing"
    | "phone"
    | "website"
    | "citations_responded";
  label: string;
  subtitle: string;
  href: string;
  done: boolean;
}

interface ComputeArgs {
  facility: Pick<
    Facility,
    | "photos"
    | "description"
    | "amenities"
    | "price_min"
    | "price_max"
    | "phone"
    | "website"
    | "citation_count"
  >;
  /**
   * How many of this facility's citations currently have a public
   * response. Callers pass this in; the widget can't query it on its
   * own without a second round-trip. Pass 0 if no citations exist
   * OR if none have been responded to — the step is only surfaced when
   * citation_count > 0 anyway.
   */
  citationResponseCount: number;
}

const MIN_PHOTOS = 3;
const MIN_DESCRIPTION_CHARS = 120; // roughly two real sentences
const MIN_AMENITIES = 3;

export function computeOnboardingState({
  facility,
  citationResponseCount,
}: ComputeArgs): {
  steps: OnboardingStep[];
  completionPercent: number;
  isComplete: boolean;
} {
  const steps: OnboardingStep[] = [
    {
      key: "photos",
      label: `Upload at least ${MIN_PHOTOS} photos`,
      subtitle:
        "Real rooms, dining, outdoor areas. Stock-feel images underperform no photos at all.",
      href: "/for-facilities/dashboard/profile",
      done: Boolean(
        facility.photos && facility.photos.length >= MIN_PHOTOS
      ),
    },
    {
      key: "description",
      label: "Write a detailed description",
      subtitle:
        "Two to three paragraphs on your care philosophy, staff, and what makes your community distinct.",
      href: "/for-facilities/dashboard/profile",
      done: Boolean(
        facility.description &&
          facility.description.length >= MIN_DESCRIPTION_CHARS
      ),
    },
    {
      key: "amenities",
      label: `List at least ${MIN_AMENITIES} amenities`,
      subtitle:
        "Families filter by amenities. Private rooms, memory-care wing, religious services, pet-friendly, etc.",
      href: "/for-facilities/dashboard/profile",
      done: Boolean(
        facility.amenities && facility.amenities.length >= MIN_AMENITIES
      ),
    },
    {
      key: "pricing",
      label: "Confirm pricing range",
      subtitle:
        "Families without a published price skip the listing. Even a wide range is better than no number.",
      href: "/for-facilities/dashboard/profile",
      done: Boolean(facility.price_min),
    },
    {
      key: "phone",
      label: "Confirm your phone number",
      subtitle:
        "Direct phone contact is the #1 family-to-facility conversion action.",
      href: "/for-facilities/dashboard/profile",
      done: Boolean(facility.phone),
    },
    {
      key: "website",
      label: "Link your website",
      subtitle:
        "Even a simple homepage drives credibility. If you don't have one, link a Facebook or Google Business page.",
      href: "/for-facilities/dashboard/profile",
      done: Boolean(facility.website),
    },
  ];

  // Citation-response step is conditional — only applies if the
  // facility has any citations on the record.
  if ((facility.citation_count || 0) > 0) {
    steps.push({
      key: "citations_responded",
      label: `Respond to ${facility.citation_count} state citation${
        facility.citation_count === 1 ? "" : "s"
      }`,
      subtitle:
        "Your response appears next to each citation on the public page — rare in this industry and worth a lot to families.",
      href: "/for-facilities/dashboard/profile",
      done: citationResponseCount >= (facility.citation_count || 0),
    });
  }

  const completed = steps.filter((s) => s.done).length;
  const completionPercent = Math.round((completed / steps.length) * 100);
  const isComplete = completed === steps.length;

  return { steps, completionPercent, isComplete };
}
