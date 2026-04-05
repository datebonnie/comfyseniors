interface QuizProgressProps {
  currentStep: number;
  totalSteps: number;
}

export default function QuizProgress({
  currentStep,
  totalSteps,
}: QuizProgressProps) {
  const pct = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="mb-8">
      <div className="mb-2 flex w-full items-center justify-between">
        <span className="text-xs text-cs-muted">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-xs text-cs-muted">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-cs-border">
        <div
          className="h-full rounded-full bg-cs-blue transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
