import type { Metadata } from "next";
import PageWrapper from "@/components/layout/PageWrapper";
import FAQPageClient from "@/components/faq/FAQPageClient";
import { createClient } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Senior Care FAQ — ComfySeniors | New Jersey",
  description:
    "Answers to common questions about senior care in New Jersey: costs, Medicare, Medicaid, inspections, and how to find the right facility.",
};

async function getAllFAQs() {
  const supabase = createClient();

  const { data } = await supabase
    .from("faq_questions")
    .select("question, answer, category, order_index")
    .order("order_index", { ascending: true });

  return (data ?? []).map((faq) => ({
    question: faq.question as string,
    answer: (faq.answer as string) ?? "",
    category: (faq.category as string) ?? "General",
  }));
}

export default async function FAQPage() {
  let faqs: { question: string; answer: string; category: string }[] = [];

  try {
    faqs = await getAllFAQs();
  } catch {
    // Render with empty state if Supabase unavailable
  }

  // Extract unique categories in order of appearance
  const categories = Array.from(
    new Set(faqs.map((f) => f.category))
  );

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="font-display text-hero-mobile text-cs-blue-dark md:text-hero">
            Senior Care FAQ
          </h1>
          <p className="mt-3 text-lg text-cs-muted">
            Plain-English answers to the most common questions about senior care
            in New Jersey.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <FAQPageClient faqs={faqs} categories={categories} />
        </div>
      </section>
    </PageWrapper>
  );
}
