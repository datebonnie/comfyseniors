import type { Facility } from "@/types";
import ContactForm from "./ContactForm";

type ContactProps = Pick<Facility, "id" | "name" | "phone" | "website" | "email">;

export default function ContactSidebar({
  id,
  name,
  phone,
  website,
}: ContactProps) {
  return (
    <div className="rounded-lg border border-cs-border bg-white p-5 sm:p-6 lg:sticky lg:top-24">
      <h3 className="mb-4 font-sans text-base font-medium text-cs-blue-dark">
        Contact this facility directly
      </h3>

      <div className="space-y-3">
        <ContactForm facilityId={id} facilityName={name} />

        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-cs-blue px-5 py-2.5 text-sm font-medium text-cs-blue transition-colors hover:bg-cs-blue-light"
          >
            Visit website
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

        {phone && (
          <a
            href={`tel:${phone}`}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-cs-border px-5 py-2.5 text-sm font-medium text-cs-body transition-colors hover:bg-cs-lavender-mist"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
            </svg>
            Call: {phone}
          </a>
        )}
      </div>

      <div className="mt-5 border-t border-cs-border pt-4">
        <p className="text-xs italic leading-relaxed text-cs-lavender">
          We never share your contact info.
          <br />
          You are in control.
        </p>
      </div>
    </div>
  );
}
