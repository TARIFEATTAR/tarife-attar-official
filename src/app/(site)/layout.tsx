import type { Metadata } from "next";
import { EB_Garamond, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import "../globals.css";

// Primary serif font - elegant, editorial
const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

// Technical mono font - industrial, precise
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Tarife Attär | Scent Archive",
  description:
    "A curated archive of rare and vintage fragrances. Explore the Atlas of scent history.",
  keywords: ["perfume", "fragrance", "vintage", "archive", "scent", "attar"],
  authors: [{ name: "Tarife Attär" }],
  openGraph: {
    title: "Tarife Attär | Scent Archive",
    description: "A curated archive of rare and vintage fragrances.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ebGaramond.variable} ${jetbrainsMono.variable} overflow-x-hidden`}>
      <body className="min-h-screen bg-theme-alabaster text-theme-charcoal antialiased font-serif overflow-x-hidden">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
