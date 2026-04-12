import type { InspectionDeficiency } from "@/types";

interface TourQuestionsProps {
  facilityName: string;
  deficiencies: InspectionDeficiency[];
}

const GENERAL_QUESTIONS = [
  "What is the all-in monthly cost, including all fees and surcharges?",
  "What is the staff-to-resident ratio during day and night shifts?",
  "How do you handle medical emergencies?",
  "Can I see a copy of your most recent state inspection report?",
  "What happens if my loved one's care needs change?",
  "Can I speak with current residents or family members?",
  "What is the community fee and is it refundable?",
  "What are the contract cancellation terms?",
];

const CATEGORY_QUESTIONS: Record<string, string[]> = {
  "Infection Control Deficiencies": [
    "What infection control protocols are in place after recent citations?",
    "How often are hand hygiene audits performed?",
    "What isolation procedures are followed for infectious diseases?",
  ],
  "Quality of Life and Care Deficiencies": [
    "How is care plan compliance monitored?",
    "What steps have you taken to address past quality of care issues?",
    "How quickly are call bells answered on average?",
  ],
  "Resident Rights Deficiencies": [
    "How do you ensure resident privacy and dignity?",
    "What is your process for handling resident complaints?",
  ],
  "Freedom from Abuse, Neglect, and Exploitation": [
    "What is your abuse prevention training program?",
    "How are staff background checks conducted?",
    "What steps have you taken since recent citations in this area?",
  ],
  "Nursing and Physician Services Deficiencies": [
    "What is the RN-to-resident ratio on each shift?",
    "How quickly can a doctor see a resident if needed?",
  ],
  "Pharmacy Service Deficiencies": [
    "How are medications stored and tracked?",
    "What is the medication error rate?",
  ],
  "Resident Assessment and Care Planning Deficiencies": [
    "How often are care plans updated?",
    "Who participates in care planning meetings?",
  ],
};

export default function TourQuestions({
  facilityName,
  deficiencies,
}: TourQuestionsProps) {
  // Get top deficiency categories
  const categoryCount = new Map<string, number>();
  for (const d of deficiencies) {
    if (d.category) {
      categoryCount.set(d.category, (categoryCount.get(d.category) ?? 0) + 1);
    }
  }

  const topCategories = Array.from(categoryCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const targetedQuestions: string[] = [];
  for (const [category] of topCategories) {
    const qs = CATEGORY_QUESTIONS[category] ?? [];
    targetedQuestions.push(...qs);
  }

  return (
    <div className="rounded-btn border border-cs-border bg-white p-5">
      <h4 className="mb-2 font-semibold text-cs-blue-dark">
        Questions to ask on your tour
      </h4>
      <p className="mb-4 text-xs text-cs-muted">
        Personalized questions based on {facilityName}&apos;s actual inspection
        history and care type.
      </p>

      {targetedQuestions.length > 0 && (
        <div className="mb-5">
          <h5 className="label mb-2 text-cs-lavender">
            Based on inspection history
          </h5>
          <ul className="space-y-2">
            {targetedQuestions.map((q, i) => (
              <li
                key={i}
                className="flex gap-2 rounded-btn border-l-[3px] border-cs-lavender bg-cs-lavender-mist p-3 text-sm text-cs-body"
              >
                <span className="font-semibold text-cs-blue">{i + 1}.</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h5 className="label mb-2 text-cs-lavender">Essential questions</h5>
        <ul className="space-y-1.5">
          {GENERAL_QUESTIONS.map((q, i) => (
            <li key={i} className="flex gap-2 text-sm text-cs-body">
              <span className="text-cs-muted">•</span>
              <span>{q}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-xs italic text-cs-muted">
        Tip: Bring a notepad and take notes. Visit at different times of day.
        Ask to see the dining room during a meal.
      </p>
    </div>
  );
}
