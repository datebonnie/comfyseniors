"use client";

import { useState } from "react";
import FAQAccordion from "@/components/ui/FAQAccordion";
import { AIAnswerBox } from "@/components/faq";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface FAQPageClientProps {
  faqs: FAQItem[];
  categories: string[];
}

export default function FAQPageClient({
  faqs,
  categories,
}: FAQPageClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? faqs.filter((f) => f.category === activeCategory)
    : faqs;

  return (
    <>
      {/* AI Answer Engine */}
      <div className="mb-10">
        <AIAnswerBox />
      </div>

      {/* Category strip */}
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={`rounded-pill border-[1.5px] px-4 py-2 text-sm font-medium transition-colors ${
            activeCategory === null
              ? "border-cs-blue bg-cs-blue text-white"
              : "border-cs-border-blue bg-cs-blue-light text-cs-blue hover:bg-cs-blue hover:text-white"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() =>
              setActiveCategory(activeCategory === cat ? null : cat)
            }
            className={`rounded-pill border-[1.5px] px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === cat
                ? "border-cs-blue bg-cs-blue text-white"
                : "border-cs-border-blue bg-cs-blue-light text-cs-blue hover:bg-cs-blue hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ list */}
      {filtered.length > 0 ? (
        <FAQAccordion
          items={filtered.map((f) => ({
            question: f.question,
            answer: f.answer,
          }))}
        />
      ) : (
        <p className="py-8 text-center text-cs-muted">
          No questions in this category yet.
        </p>
      )}
    </>
  );
}
