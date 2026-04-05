import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  createPageUrl: (page: number) => string;
}

export default function Pagination({
  currentPage,
  totalPages,
  createPageUrl,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Generate visible page numbers (max 7 buttons)
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <nav
      className="mt-8 flex items-center justify-center gap-1"
      aria-label="Search results pagination"
    >
      {/* Previous */}
      {currentPage > 1 ? (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="rounded-lg border border-cs-border px-3 py-2 text-sm text-cs-body transition-colors hover:bg-cs-blue-light"
        >
          Previous
        </Link>
      ) : (
        <span className="rounded-lg border border-cs-border px-3 py-2 text-sm text-cs-muted/40">
          Previous
        </span>
      )}

      {/* Page numbers */}
      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-sm text-cs-muted">
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={createPageUrl(page)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              page === currentPage
                ? "bg-cs-blue text-white"
                : "text-cs-body hover:bg-cs-blue-light"
            }`}
          >
            {page}
          </Link>
        )
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="rounded-lg border border-cs-border px-3 py-2 text-sm text-cs-body transition-colors hover:bg-cs-blue-light"
        >
          Next
        </Link>
      ) : (
        <span className="rounded-lg border border-cs-border px-3 py-2 text-sm text-cs-muted/40">
          Next
        </span>
      )}
    </nav>
  );
}
