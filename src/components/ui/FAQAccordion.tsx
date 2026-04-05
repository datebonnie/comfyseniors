interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  className?: string;
}

export default function FAQAccordion({
  items,
  className = "",
}: FAQAccordionProps) {
  if (items.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, i) => (
        <details key={i} className="group rounded-pill border border-cs-border bg-white">
          <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 font-sans text-base font-medium text-cs-blue-dark transition-colors hover:text-cs-blue [&::-webkit-details-marker]:hidden">
            <span>{item.question}</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 text-cs-blue transition-transform group-open:rotate-180"
            >
              <path d="M5 7.5L10 12.5L15 7.5" />
            </svg>
          </summary>
          <div className="px-5 pb-5 pr-10 text-sm leading-relaxed text-cs-body">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
