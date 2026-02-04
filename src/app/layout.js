import { Cinzel, Inter } from "next/font/google";
import "@/styles/globals.css";

const cinzel = Cinzel({
    subsets: ["latin"],
    variable: "--font-heading",
    weight: ["400", "700"],
});

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-body",
});

export const metadata = {
    title: "Astromuni - Authentic Vedic Astrology",
    description: "Precise Vedic Astrology calculations with premium insights.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={`${cinzel.variable} ${inter.variable}`}>
            <body className="antialiased min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
                {children}
            </body>
        </html>
    );
}
