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

// Metadata export removed as it's now in the root layout or handled by pages

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${ebGaramond.variable} ${jetbrainsMono.variable} min-h-screen bg-theme-alabaster text-theme-charcoal antialiased font-serif overflow-x-hidden cursor-none`}>
      <Providers>
        {children}
      </Providers>
    </div>
  );
}
