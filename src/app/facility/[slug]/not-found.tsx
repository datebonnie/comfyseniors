import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";

export default function FacilityNotFound() {
  return (
    <PageWrapper>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-hero-mobile text-cs-blue-dark md:text-hero">
          Facility not found
        </h1>
        <p className="mt-4 text-lg text-cs-muted">
          We couldn&apos;t find this facility. It may have been removed or the
          URL may be incorrect.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button href="/search" size="lg">
            Search facilities
          </Button>
          <Button href="/" variant="ghost" size="lg">
            Go home
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}
