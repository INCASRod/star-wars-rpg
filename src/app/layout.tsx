import type { Metadata, Viewport } from "next";
import { Orbitron, Exo_2 } from "next/font/google";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";
import { ThemeInit } from "@/components/ThemeInit";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const exo2 = Exo_2({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const swRpgIcons = localFont({
  src: "../../public/fonts/sw-rpg-icons.ttf",
  variable: "--font-sw-rpg-icons",
  display: "block",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: "HOLOCRON // Campaign Manager",
  description: "Star Wars RPG Campaign Manager — FFG/Genesys System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${orbitron.variable} ${exo2.variable} ${swRpgIcons.variable}`}>
      <body className="antialiased">
        <ThemeInit />
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
