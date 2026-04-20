import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://comfyseniors.com"),
  title:
    "Bergen County, NJ Assisted Living and Memory Care — ComfySeniors",
  description:
    "Bergen County, NJ assisted living and memory care — verified listings, real prices, no phone harvesting.",
  openGraph: {
    title:
      "Bergen County, NJ Assisted Living and Memory Care — ComfySeniors",
    description:
      "Bergen County, NJ assisted living and memory care — verified listings, real prices, no phone harvesting.",
    url: "https://comfyseniors.com",
    siteName: "ComfySeniors",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Bergen County, NJ Assisted Living and Memory Care — ComfySeniors",
    description:
      "Bergen County, NJ assisted living and memory care — verified listings, real prices, no phone harvesting.",
    site: "@comfyseniors",
    creator: "@comfyseniors",
  },
  other: {
    "instagram:creator": "@comfyseniors",
    "tiktok:creator": "@comfyseniors",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jakarta.variable}`}>
      <head>
        <script
          defer
          data-domain="comfyseniors.com"
          src="https://plausible.io/js/script.js"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
