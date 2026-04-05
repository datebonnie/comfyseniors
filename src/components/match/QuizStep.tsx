interface QuizOption {
  value: string;
  label: string;
}

interface QuizStepProps {
  question: string;
  options: QuizOption[];
  selected: string;
  onSelect: (value: string) => void;
  hasInput?: boolean;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  inputPlaceholder?: string;
  secondaryLabel?: string;
  secondaryOptions?: QuizOption[];
  secondarySelected?: string;
  onSecondarySelect?: (value: string) => void;
}

export default function QuizStep({
  question,
  options,
  selected,
  onSelect,
  hasInput,
  inputValue,
  onInputChange,
  inputPlaceholder,
  secondaryLabel,
  secondaryOptions,
  secondarySelected,
  onSecondarySelect,
}: QuizStepProps) {
  return (
    <div>
      <h2 className="mb-6 font-display text-2xl text-cs-blue-dark sm:text-3xl">
        {question}
      </h2>

      {hasInput ? (
        <div className="space-y-5">
          <input
            type="text"
            value={inputValue ?? ""}
            onChange={(e) => onInputChange?.(e.target.value)}
            placeholder={inputPlaceholder}
            className="w-full rounded-pill border border-cs-border bg-white px-4 py-3 text-cs-body outline-none placeholder:text-cs-muted/60 focus:border-cs-blue focus:ring-2 focus:ring-cs-blue/10"
          />

          {secondaryLabel && secondaryOptions && (
            <div>
              <p className="mb-3 text-sm font-medium text-cs-muted">
                {secondaryLabel}
              </p>
              <div className="flex flex-wrap gap-2">
                {secondaryOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => onSecondarySelect?.(opt.value)}
                    className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                      secondarySelected === opt.value
                        ? "border-cs-blue bg-cs-blue text-white"
                        : "border-cs-border bg-white text-cs-body hover:border-cs-blue/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              className={`rounded-pill border px-5 py-4 text-left text-sm transition-colors ${
                selected === opt.value
                  ? "border-2 border-cs-blue bg-cs-blue-light text-cs-blue-dark"
                  : "border border-cs-border bg-white text-cs-body hover:border-cs-blue/40"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
