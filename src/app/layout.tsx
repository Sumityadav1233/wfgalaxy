import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
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
      </body>
    </html>
  );
}
