import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "cs-blue": {
          DEFAULT: "#3B5BA5",
          dark: "#1E2A4A",
          light: "#F0F4FF",
        },
        "cs-lavender": {
          DEFAULT: "#8B6DB5",
          light: "#EDE9F7",
          mist: "#F8F7FC",
        },
        "cs-border": {
          DEFAULT: "#E8E4F0",
          blue: "#C7D4F0",
        },
        "cs-body": "#4B5563",
        "cs-muted": "#6B7280",
        "cs-white": "#FFFFFF",
        "cs-green-ok": "#2D7D3A",
        "cs-amber-warn": "#D97706",
        "cs-red-alert": "#B91C1C",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        hero: ["48px", { lineHeight: "1.2" }],
        "hero-mobile": ["32px", { lineHeight: "1.2" }],
      },
      letterSpacing: {
        label: "0.1em",
      },
      borderRadius: {
        card: "12px",
        btn: "8px",
        pill: "10px",
      },
    },
  },
  plugins: [],
};
export default config;
