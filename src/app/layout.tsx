import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { SpeedInsights } from '@vercel/speed-insights/next';
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  fallback: ["sans-serif", "system-ui", "arial"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  fallback: ["serif", "Georgia", "Times New Roman"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://wfgalaxy.vercel.app'),
  title: "WF GALAXY | Premium Fashion & Outerwear",
  description: "Carry style with confidence. Discover elevated essentials and luxury outerwear at WF GALAXY, Shiv Chowk, Janakpur.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} ${playfair.variable} min-h-full flex flex-col font-sans antialiased`}>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
