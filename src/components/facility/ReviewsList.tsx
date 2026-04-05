import type { Review } from "@/types";
import StarRating from "@/components/ui/StarRating";

interface ReviewsListProps {
  reviews: Review[];
}

export default function ReviewsList({ reviews }: ReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-cs-muted">
          No reviews yet. Be the first to share your experience.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-cs-border">
      {reviews.map((review) => {
        const date = new Date(review.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        return (
          <div key={review.id} className="py-5">
            <div className="flex flex-wrap items-center gap-3">
              <StarRating rating={review.rating} />
              <span className="text-sm font-medium text-cs-body">
                {review.reviewer_name || "Anonymous"}
              </span>
              {review.relationship && (
                <span className="text-sm text-cs-muted">
                  ({review.relationship})
                </span>
              )}
            </div>

            {review.body && (
              <p className="mt-2 text-sm leading-relaxed text-cs-body">
                {review.body}
              </p>
            )}

            <p className="mt-2 text-xs text-cs-muted">{date}</p>
          </div>
        );
      })}
    </div>
  );
}
