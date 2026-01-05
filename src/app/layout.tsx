import "./globals.css";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Tarife Attär | Scent Archive",
    description: "A curated archive of rare and vintage fragrances.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
