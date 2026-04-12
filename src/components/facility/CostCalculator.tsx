"use client";

import { useState } from "react";

interface CostCalculatorProps {
  priceMin: number | null;
  priceMax: number | null;
}

export default function CostCalculator({
  priceMin,
  priceMax,
}: CostCalculatorProps) {
  const basePrice = priceMin ? (priceMin + (priceMax || priceMin)) / 2 : 5000;

  const [monthlyRate, setMonthlyRate] = useState(Math.round(basePrice));
  const [communityFee, setCommunityFee] = useState(3000);
  const [careLevelAdd, setCareLevelAdd] = useState(500);
  const [medicationMgmt, setMedicationMgmt] = useState(300);
  const [monthsStay, setMonthsStay] = useState(12);

  const monthlyTotal = monthlyRate + careLevelAdd + medicationMgmt;
  const firstYearCost = monthlyTotal * monthsStay + communityFee;

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return (
    <div className="rounded-btn border border-cs-border bg-white p-5">
      <h4 className="mb-2 font-semibold text-cs-blue-dark">
        Move-in cost calculator
      </h4>
      <p className="mb-4 text-xs text-cs-muted">
        Estimate your true first-year cost. Adjust values based on your quote.
      </p>

      <div className="space-y-3">
        <NumberInput
          label="Base monthly rate"
          value={monthlyRate}
          onChange={setMonthlyRate}
        />
        <NumberInput
          label="Care level surcharge"
          value={careLevelAdd}
          onChange={setCareLevelAdd}
          hint="Often added for higher care needs"
        />
        <NumberInput
          label="Medication management"
          value={medicationMgmt}
          onChange={setMedicationMgmt}
        />
        <NumberInput
          label="One-time community fee"
          value={communityFee}
          onChange={setCommunityFee}
          hint="Upfront move-in fee"
        />

        <div>
          <label className="text-xs font-medium text-cs-muted">
            Length of stay (months)
          </label>
          <input
            type="range"
            min="1"
            max="60"
            value={monthsStay}
            onChange={(e) => setMonthsStay(Number(e.target.value))}
            className="mt-1 w-full accent-cs-blue"
          />
          <p className="text-right text-xs text-cs-blue-dark">
            {monthsStay} months
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-btn border border-cs-blue bg-cs-blue-light p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium text-cs-blue-dark">
            Monthly total
          </span>
          <span className="font-display text-xl font-semibold text-cs-blue">
            {formatCurrency(monthlyTotal)}
          </span>
        </div>
        <div className="mt-2 flex items-baseline justify-between border-t border-cs-blue/20 pt-2">
          <span className="text-sm font-medium text-cs-blue-dark">
            {monthsStay}-month total
          </span>
          <span className="font-display text-2xl font-semibold text-cs-blue">
            {formatCurrency(firstYearCost)}
          </span>
        </div>
      </div>

      <p className="mt-3 text-xs text-cs-muted">
        Estimates only. Actual costs vary. Always confirm with the facility.
      </p>
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  hint?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-cs-muted">{label}</label>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-cs-muted">$</span>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="flex-1 rounded border border-cs-border px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-cs-blue/20"
        />
      </div>
      {hint && <p className="mt-0.5 text-[10px] text-cs-muted">{hint}</p>}
    </div>
  );
}
