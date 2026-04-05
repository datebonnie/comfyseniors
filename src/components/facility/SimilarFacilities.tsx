import type { FacilityWithStats } from "@/types";
import FacilityCard from "@/components/ui/FacilityCard";

interface SimilarFacilitiesProps {
  facilities: FacilityWithStats[];
}

export default function SimilarFacilities({
  facilities,
}: SimilarFacilitiesProps) {
  if (facilities.length === 0) return null;

  return (
    <section className="mt-12 border-t border-cs-border pt-10">
      <h2 className="mb-6 font-sans text-xl font-semibold text-cs-blue-dark">
        Similar facilities nearby
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {facilities.map((f) => (
          <FacilityCard key={f.id} facility={f} />
        ))}
      </div>
    </section>
  );
}
