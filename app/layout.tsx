import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google"; // Remove Geist
import { Lato, Merriweather } from "next/font/google"; // Add Lato and Merriweather
import "./globals.css";
import { cn } from "@/lib/utils";
import { NuqsAdapter } from 'nuqs/adapters/next/app'; // Add NuqsAdapter import

// Configure Lato for sans-serif
const lato = Lato({
  variable: "--font-sans", // Use standard CSS variable name
  subsets: ["latin"],
  weight: ["400", "700"], // Include weights as needed
});

// Configure Merriweather for serif
const merriweather = Merriweather({
  variable: "--font-serif", // Use standard CSS variable name
  subsets: ["latin"],
  weight: ["400", "700"], // Include weights as needed
});

export const metadata: Metadata = {
  title: "Mutual Fund NAV Visualizer",
  description: "Visualize and analyze historical Mutual Fund NAV data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning /* Add suppressHydrationWarning for theme changes */ >
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased", // Use font-sans by default
          lato.variable, // Apply Lato variable
          merriweather.variable // Apply Merriweather variable
        )}
      >
        <NuqsAdapter>{children}</NuqsAdapter> {/* Wrap children */}
      </body>
    </html>
  );
}
