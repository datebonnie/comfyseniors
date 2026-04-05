"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
  size?: "lg" | "md";
  className?: string;
}

export default function SearchBar({
  defaultValue = "",
  placeholder = "Search by facility name, city, or zip...",
  size = "md",
  className = "",
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (value.trim()) params.set("q", value.trim());
    router.push(`/search?${params.toString()}`);
  }

  const isLg = size === "lg";

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex w-full overflow-hidden rounded-pill border-[1.5px] border-[#CBD5E1] bg-white shadow-sm transition-shadow focus-within:border-cs-blue focus-within:shadow-md focus-within:ring-2 focus-within:ring-cs-blue/10 ${className}`}
    >
      {/* Search icon */}
      <div
        className={`flex shrink-0 items-center pl-4 text-cs-muted ${isLg ? "pl-5" : ""}`}
      >
        <svg
          width={isLg ? 22 : 18}
          height={isLg ? 22 : 18}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-transparent outline-none placeholder:text-cs-muted/60 ${
          isLg ? "px-4 py-4 text-lg" : "px-3 py-2.5 text-sm"
        }`}
      />

      <button
        type="submit"
        className={`shrink-0 bg-cs-blue font-medium text-white transition-colors hover:bg-cs-blue-dark ${
          isLg ? "px-7 text-base" : "px-5 text-sm"
        }`}
      >
        Search
      </button>
    </form>
  );
}
